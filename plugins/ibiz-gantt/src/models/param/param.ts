import Variables from '@/constants/vars';
import { DropType } from '@/typings/drop';
import type RowItem from '../data/row';

export default class Param {
  private _currentTop: number = 0;
  public get currentTop(): number {
    return this._currentTop;
  }

  public set currentTop(v: number) {
    this._currentTop = v;
  }

  private _rootHeight: number = 0;
  public get rootHeight(): number {
    return this._rootHeight;
  }

  public set rootHeight(v: number) {
    this._rootHeight = v;
  }

  private _hoverItem: RowItem | null = null;
  public get hoverItem(): RowItem | null {
    return this._hoverItem;
  }

  public set hoverItem(v: RowItem | null) {
    this._hoverItem = v;
  }

  private _selectItem: RowItem | null = null;
  public get selectItem(): RowItem | null {
    return this._selectItem;
  }

  public set selectItem(v: RowItem | null) {
    this._selectItem = v;
  }

  private _moveType: DropType = 'none'
  public get moveType(): DropType {
    return this._moveType;
  }

  public set moveType(v: DropType) {
    this._moveType = v;
  }

  private _moveHoverItem: RowItem | null = null;
  public get moveHoverItem(): RowItem | null {
    return this._moveHoverItem;
  }

  public set moveHoverItem(v: RowItem | null) {
    this._moveHoverItem = v;
  }

  private _moveStartItem: RowItem | null = null;
  public get moveStartItem(): RowItem | null {
    return this._moveStartItem;
  }

  public set moveStartItem(v: RowItem | null) {
    this._moveStartItem = v;
  }

  private _showMoveLine: boolean = false;
  public get showMoveLine(): boolean {
    return this._showMoveLine;
  }

  public set showMoveLine(v: boolean) {
    this._showMoveLine = v;
  }

  private _headerHeight: number = Variables.default.headerHeight;
  public get headerHeight(): number {
    return this._headerHeight;
  }

  public set headerHeight(v: number) {
    this._headerHeight = v;
  }
  private _allowDrag: Function | undefined;
  public get allowDrag(): Function | undefined {
    return this._allowDrag;
  }

  public set allowDrag(v: Function | undefined) {
    this._allowDrag = v;
  }

  private _enableDateCompletion: boolean = false;
  public get enableDateCompletion(): boolean {
    return this._enableDateCompletion;
  }

  public set enableDateCompletion(v: boolean) {
    this._enableDateCompletion = v;
  }

  private _allowDrop: Function | undefined;
  public get allowDrop(): Function | undefined {
    return this._allowDrop;
  }

  public set allowDrop(v: Function | undefined) {
    this._allowDrop = v;
  }

  private _dateRange: DateRange | undefined;
  public get dateRange(): DateRange | undefined {
    return this._dateRange;
  }

  public set dateRange(v: DateRange | undefined) {
    this._dateRange = v;
  }

  private _fullScreen: boolean = false;

  public get fullScreen(): boolean {
    return this._fullScreen;
  }

  public set fullScreen(v: boolean) {
    this._fullScreen = v;
  }

  private _showWeekdays: Array<number> = [0, 1, 2, 3, 4, 5, 6];

  public get showWeekdays(): Array<number> {
    return this._showWeekdays;
  }

  public set showWeekdays(v: Array<number>) {
    this._showWeekdays = v;
  }

  private _headerDrag: boolean = false;
  public get headerDrag(): boolean {
    return this._headerDrag;
  }

  public set headerDrag(v: boolean) {
    this._headerDrag = v;
  }

  private _preload: number = 5;

  public get preload(): number {
    return this._preload;
  }

  public set preload(v: number) {
    this._preload = v;
  }

  private _expandColumnName: string | null = null;

  public get expandColumnName(): string | null  {
    return this._expandColumnName;
  }

  public set expandColumnName(v: string | null) {
    this._expandColumnName = v;
  }
}
