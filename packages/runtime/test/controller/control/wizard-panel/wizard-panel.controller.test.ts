import { RuntimeError } from '@ibiz-template/core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { WizardPanelController } from '../../../../src/controller/control/wizard-panel/wizard-panel.controller';

function createController(): WizardPanelController {
  const controller = Object.create(
    WizardPanelController.prototype,
  ) as WizardPanelController;
  Object.assign(controller, {
    state: { activeFormTag: 'fill_info' },
    formControllers: new Map(),
    formControllerWaiters: new Map(),
    formData: {},
    calcButtonState: vi.fn(),
  });
  return controller;
}

function waitForFormController(
  controller: WizardPanelController,
): Promise<unknown> {
  return (
    controller as unknown as {
      waitForFormController: () => Promise<unknown>;
    }
  ).waitForFormController();
}

function createFormController(): Record<string, unknown> {
  return {
    evt: {
      on: vi.fn(),
    },
    load: vi.fn().mockResolvedValue({}),
    data: {},
  };
}

describe('WizardPanelController.waitForFormController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns an already mounted form controller', async () => {
    const controller = createController();
    const formController = createFormController();
    controller.formControllers.set('fill_info', formController as never);

    await expect(waitForFormController(controller)).resolves.toBe(
      formController,
    );
  });

  test('resolves after the active form controller mounts', async () => {
    const controller = createController();
    const formController = createFormController();
    const pendingController = waitForFormController(controller);

    await controller.onFormMounted('fill_info', {
      ctrl: formController,
    } as never);

    await expect(pendingController).resolves.toBe(formController);
  });

  test('shares one pending controller between concurrent callers', async () => {
    const controller = createController();
    const formController = createFormController();
    const firstPendingController = waitForFormController(controller);
    const secondPendingController = waitForFormController(controller);

    expect(
      (
        controller as unknown as {
          formControllerWaiters: Map<string, unknown>;
        }
      ).formControllerWaiters.size,
    ).toBe(1);
    await controller.onFormMounted('fill_info', {
      ctrl: formController,
    } as never);

    await expect(firstPendingController).resolves.toBe(formController);
    await expect(secondPendingController).resolves.toBe(formController);
  });

  test('rejects when the active form controller does not mount in time', async () => {
    vi.useFakeTimers();
    const controller = createController();
    const pendingController = waitForFormController(controller);
    const rejectedError = pendingController.catch(error => error);

    await vi.advanceTimersByTimeAsync(5000);

    const error = await rejectedError;
    expect(error).toBeInstanceOf(RuntimeError);
    expect(error.message).toContain('fill_info');
  });
});
