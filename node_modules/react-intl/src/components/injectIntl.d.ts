import * as React from 'react';
import { IntlShape } from '../types';
export declare const Provider: React.Provider<IntlShape>;
export declare const Context: React.Context<IntlShape>;
export interface Opts<IntlPropName extends string = 'intl', ForwardRef extends boolean = false> {
    intlPropName?: IntlPropName;
    forwardRef?: ForwardRef;
    enforceContext?: boolean;
}
export declare type WrappedComponentProps<IntlPropName extends string = 'intl'> = {
    [k in IntlPropName]: IntlShape;
};
export declare type WithIntlProps<P> = Omit<P, keyof WrappedComponentProps> & {
    forwardedRef?: React.Ref<any>;
};
export default function injectIntl<IntlPropName extends string = 'intl', P extends WrappedComponentProps<IntlPropName> = WrappedComponentProps<any>>(WrappedComponent: React.ComponentType<P>, options?: Opts<IntlPropName, false>): React.FC<WithIntlProps<P>> & {
    WrappedComponent: React.ComponentType<P>;
};
export default function injectIntl<IntlPropName extends string = 'intl', P extends WrappedComponentProps<IntlPropName> = WrappedComponentProps<any>, T extends React.ComponentType<P> = any>(WrappedComponent: React.ComponentType<P>, options?: Opts<IntlPropName, true>): React.ForwardRefExoticComponent<React.PropsWithoutRef<WithIntlProps<React.PropsWithChildren<P>>> & React.RefAttributes<T>> & {
    WrappedComponent: React.ComponentType<P>;
};
//# sourceMappingURL=injectIntl.d.ts.map