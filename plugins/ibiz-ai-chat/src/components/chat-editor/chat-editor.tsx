/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'preact/hooks';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import { UndoRedo } from '@tiptap/extensions';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler';
import { Namespace } from '../../utils';
import { AiChatController } from '../../controller';
import './chat-editor.scss';

export interface ChatEditorProps {
  /**
   * @description 聊天控制器
   * @type {AiChatController}
   * @memberof ChatEditorProps
   */
  c: AiChatController;
  /**
   * @description 编辑器值
   * @type {string}
   * @memberof ChatEditorProps
   */
  value: string;
  /**
   * @description 是否禁用
   * @type {boolean}
   * @memberof ChatEditorProps
   */
  disabled: boolean;
  /**
   * @description 编辑器创建事件
   * @memberof ChatEditorProps
   */
  onCreate: (editor: Editor) => void;
  /**
   * @description 值改变事件
   * @memberof ChatEditorProps
   */
  onChange: (value: string) => void;
  /**
   * @description 键盘输入事件
   * @memberof ChatEditorProps
   */
  onKeyDown: (e: KeyboardEvent) => boolean | void;
}

const ns = new Namespace('chat-editor');

export const ChatEditor = ({
  c,
  value,
  disabled,
  onCreate,
  onChange,
  onKeyDown,
}: ChatEditorProps) => {
  // 编辑器引用
  const editorRef = useRef<Editor>(null);
  // 编辑器元素引用
  const editorElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorElementRef.current) return;

    const uploadHeaders = (window as any).ibiz.util.file.getUploadHeaders();

    const { uploadUrl, downloadUrl } = (
      window as any
    ).ibiz.util.file.calcFileUpDownUrl(
      c.context,
      c.params,
      {},
      {
        enableNoAccess: true,
        globalDownloadPrifix: c.opts.uploader.globalDownloadPrifix,
      },
    );

    // 上传文件
    const uploadFile = async (
      file: Blob,
    ): Promise<{ name: string; url: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await (window as any).ibiz.net.axios({
        url: uploadUrl,
        method: 'post',
        headers: uploadHeaders,
        data: formData,
      });
      const data = res.data;
      if (!data) return { name: '', url: '' };
      const url = downloadUrl.replace('%fileId%', data.fileid);
      return { name: data.name, url };
    };

    const editor = new Editor({
      element: editorElementRef.current,
      extensions: [
        Document,
        Text.extend({
          addKeyboardShortcuts() {
            return {
              'Mod-Enter': () => {
                editorRef.current?.commands.enter();
                editorRef.current?.commands.scrollIntoView();
                return true;
              },
              'Shift-Enter': () => {
                editorRef.current?.commands.enter();
                editorRef.current?.commands.scrollIntoView();
                return true;
              },
            };
          },
        }),
        Paragraph,
        UndoRedo,
        Image.configure({
          inline: true,
          allowBase64: true,
          HTMLAttributes: {
            draggable: 'false',
          },
        }).extend({
          draggable: false,
        }),
        FileHandler.configure({
          onDrop: async (currentEditor, files) => {
            files = files.filter(file => file.type.startsWith('image/'));
            if (!files.length) return;
            const uploadedFiles = await Promise.all(
              files.map(file => uploadFile(file)),
            );
            if (currentEditor.isDestroyed) return;
            currentEditor
              .chain()
              .deleteSelection()
              .insertContentAt(
                currentEditor.state.selection.from,
                uploadedFiles.map(file => ({
                  type: 'image',
                  attrs: {
                    src: file.url,
                    alt: file.name,
                  },
                })),
              )
              .focus()
              .scrollIntoView()
              .run();
          },
          onPaste: async (currentEditor, files) => {
            files = files.filter(file => file.type.startsWith('image/'));
            if (!files.length) return;
            const uploadedFiles = await Promise.all(
              files.map(file => uploadFile(file)),
            );
            if (currentEditor.isDestroyed) return;
            currentEditor
              .chain()
              .deleteSelection()
              .insertContentAt(
                currentEditor.state.selection.from,
                uploadedFiles.map(file => ({
                  type: 'image',
                  attrs: {
                    src: file.url,
                    alt: file.name,
                  },
                })),
              )
              .focus()
              .scrollIntoView()
              .run();
          },
        }),
      ],
      content: value || '',
      editorProps: {
        handleKeyDown: (_view, event) => {
          return onKeyDown(event);
        },
      },
      onUpdate: () => {
        onChange(editor.getHTML());
      },
      onCreate: () => {
        onCreate(editor);
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`${ns.b()} ${disabled ? ns.m('disabled') : ''}`}>
      <div ref={editorElementRef} />
    </div>
  );
};
