export
{
	default as templateParser
}
from './modules/templateParser'

export
{
	default as templateFormatter
}
from './modules/templateFormatter'

export
{
	default as parseDigit
}
from './modules/parseDigit'

export
{
	default as parse
}
from './modules/parse'

export
{
	default as format
}
from './modules/format'

export
{
	onChange,
	onKeyDown,

	// Deprecated.
	// I don't know why these functions exist.
	onPaste,
	onCut
}
from './modules/inputControl'