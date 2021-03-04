import * as React from 'react';
import { Data, Modifiers } from 'popper.js';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'auto'
  | 'center';

export type Action = 'open' | 'close';

export interface RenderProps {
  closeFn: () => void;
}

export interface Styles {
  arrow: React.CSSProperties & {
    length?: number;
    spread?: number;
  };
  close: React.CSSProperties;
  container: React.CSSProperties;
  content: React.CSSProperties;
  floater: React.CSSProperties;
  floaterOpening: React.CSSProperties;
  floaterWithAnimation: React.CSSProperties;
  floaterWithComponent: React.CSSProperties;
  floaterClosing: React.CSSProperties;
  floaterCentered: React.CSSProperties;
  footer: React.CSSProperties;
  options: {
    zIndex?: number;
  };
  title: React.CSSProperties;
  wrapper: React.CSSProperties;
  wrapperPosition: React.CSSProperties;
}

export interface Props {
  /**
   * Open the Floater automatically.
   */
  autoOpen?: boolean;
  /**
   * It will be called when the Floater change state
   */
  callback?: (action: Action, props: PropsWithComponent | PropsWithContent) => void;
  /**
   * An element to trigger the Floater.
   */
  children?: React.ReactNode;
  /**
   * Log some basic actions.
   */
  debug?: boolean;
  /**
   * Animate the Floater on scroll/resize.
   */
  disableAnimation?: boolean;
  /**
   * Disable changes in the Floater position on scroll/resize.
   */
  disableFlip?: boolean;
  /**
   * Don't convert hover event to click on mobile.
   */
  disableHoverToClick?: boolean;
  /**
   * The event that will trigger the Floater. It can be hover | click.
   * These won't work in controlled mode.
   */
  event?: 'click' | 'hover';
  /**
   * The amount of time (in seconds) that the floater should wait after a mouseLeave event before hiding. Only valid for event type hover.
   */
  eventDelay?: number;
  /**
   * It can be anything that can be rendered.
   */
  footer?: React.ReactNode;
  /**
   * Get the popper.js instance
   */
  getPopper?: (popper: Data, origin: 'floater' | 'wrapper') => void;
  /**
   * Don't show the arrow. Useful for centered or modal layout.
   */
  hideArrow?: boolean;
  /**
   * In case that you need to identify the portal.
   */
  id?: string | number;
  /**
   * The distance between the Floater and its target in pixels.
   */
  offset?: number;
  /**
   * Controlled mode.
   */
  open?: boolean;
  /**
   * Customize popper.js modifiers.
   */
  options?: Modifiers;
  /**
   * The placement of the Floater. It will update the position if there's no space available.
   */
  placement?: Placement;
  /**
   * It will show a ⨉ button to close the Floater.
   */
  showCloseButton?: boolean;
  style?: React.CSSProperties;
  /**
   * Customize the default UI.
   */
  styles?: Partial<Styles>;
  /**
   * The target used to calculate the Floater position. If it's not set, it will use the `children` as the target.
   */
  target?: string | HTMLElement | null;
  /**
   * It can be anything that can be rendered.
   */
  title?: React.ReactNode;
  /**
   * Position the wrapper relative to the target.
   */
  wrapperOptions?: {
    offset?: number;
    placement?: Omit<Placement, 'center'>;
    position?: boolean;
  };
}

export interface PropsWithComponent extends Props {
  /**
   * A React component or function to as a custom UI for the Floater.
   * The prop closeFloater will be available in your component.
   */
  component: (renderProps: RenderProps) => React.ReactNode;
}

export interface PropsWithContent extends Props {
  /**
   * The Floater content. It can be anything that can be rendered.
   * This is the only required props, unless you pass a component.
   */
  content: React.ReactNode;
}

export default class ReactFloater extends React.Component<PropsWithComponent | PropsWithContent> {}
