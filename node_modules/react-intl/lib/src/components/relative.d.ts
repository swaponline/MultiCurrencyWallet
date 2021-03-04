import * as React from 'react';
import { RelativeTimeFormatSingularUnit } from '@formatjs/ecma402-abstract';
import { FormatRelativeTimeOptions } from '@formatjs/intl';
export interface Props extends FormatRelativeTimeOptions {
    value?: number;
    unit?: RelativeTimeFormatSingularUnit;
    updateIntervalInSeconds?: number;
    children?(value: string): React.ReactElement | null;
}
declare const FormattedRelativeTime: React.FC<Props>;
export default FormattedRelativeTime;
//# sourceMappingURL=relative.d.ts.map