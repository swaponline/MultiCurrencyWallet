import * as React from 'react';
import { FormatDateOptions } from '@formatjs/intl';
import { DateTimeFormat } from '@formatjs/ecma402-abstract';
interface Props extends FormatDateOptions {
    from: Parameters<DateTimeFormat['formatRange']>[0];
    to: Parameters<DateTimeFormat['formatRange']>[1];
    children?(value: React.ReactNode): React.ReactElement | null;
}
declare const FormattedDateTimeRange: React.FC<Props>;
export default FormattedDateTimeRange;
//# sourceMappingURL=dateTimeRange.d.ts.map