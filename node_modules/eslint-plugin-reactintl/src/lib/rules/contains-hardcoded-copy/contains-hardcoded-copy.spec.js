import { RuleTester } from 'eslint';
import rule from './contains-hardcoded-copy';
import parseJSX from '../../utils/parseJSX';

const ruleTester = new RuleTester();

const LiteralError = {
    message: 'Element contains hardcoded copy',
    type: 'Literal',
};

const options = [];

ruleTester.run('Contains hardcoded copy', rule, {
    valid: [
        { code: '<span><ComponentA /></span>', options },
    ].map(parseJSX),
    invalid: [
        { code: '<span>Literal</span>', options, errors: [LiteralError] },
        { code: '<span> { "Literal" } </span>', options, errors: [LiteralError] },
        { code: '<span>\\n  Literal</span>', options, errors: [LiteralError] },
        { code: '<span>\\n \\t Literal</span>', options, errors: [LiteralError] },
        { code: '<span>\\t  Literal</span>', options, errors: [LiteralError] },
        { code: '<span>\\r  Literal</span>', options, errors: [LiteralError] },
    ].map(parseJSX),
});
