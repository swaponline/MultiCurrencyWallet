function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import Metadata from './metadata';
import PhoneNumber from './PhoneNumber';
import AsYouTypeState from './AsYouTypeState';
import AsYouTypeFormatter, { DIGIT_PLACEHOLDER } from './AsYouTypeFormatter';
import AsYouTypeParser, { extractFormattedDigitsAndPlus } from './AsYouTypeParser';
import getCountryByCallingCode from './helpers/getCountryByCallingCode';
var USE_NON_GEOGRAPHIC_COUNTRY_CODE = false;

var AsYouType =
/*#__PURE__*/
function () {
  /**
   * @param {(string|object)?} [optionsOrDefaultCountry] - The default country used for parsing non-international phone numbers. Can also be an `options` object.
   * @param {Object} metadata
   */
  function AsYouType(optionsOrDefaultCountry, metadata) {
    _classCallCheck(this, AsYouType);

    this.metadata = new Metadata(metadata);

    var _this$getCountryAndCa = this.getCountryAndCallingCode(optionsOrDefaultCountry),
        _this$getCountryAndCa2 = _slicedToArray(_this$getCountryAndCa, 2),
        defaultCountry = _this$getCountryAndCa2[0],
        defaultCallingCode = _this$getCountryAndCa2[1];

    this.defaultCountry = defaultCountry;
    this.defaultCallingCode = defaultCallingCode;
    this.reset();
  }

  _createClass(AsYouType, [{
    key: "getCountryAndCallingCode",
    value: function getCountryAndCallingCode(optionsOrDefaultCountry) {
      // Set `defaultCountry` and `defaultCallingCode` options.
      var defaultCountry;
      var defaultCallingCode; // Turns out `null` also has type "object". Weird.

      if (optionsOrDefaultCountry) {
        if (_typeof(optionsOrDefaultCountry) === 'object') {
          defaultCountry = optionsOrDefaultCountry.defaultCountry;
          defaultCallingCode = optionsOrDefaultCountry.defaultCallingCode;
        } else {
          defaultCountry = optionsOrDefaultCountry;
        }
      }

      if (defaultCountry && !this.metadata.hasCountry(defaultCountry)) {
        defaultCountry = undefined;
      }

      if (defaultCallingCode) {
        /* istanbul ignore if */
        if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
          if (this.metadata.isNonGeographicCallingCode(defaultCallingCode)) {
            defaultCountry = '001';
          }
        }
      }

      return [defaultCountry, defaultCallingCode];
    }
    /**
     * Inputs "next" phone number characters.
     * @param  {string} text
     * @return {string} Formatted phone number characters that have been input so far.
     */

  }, {
    key: "input",
    value: function input(text) {
      var _this$parser$input = this.parser.input(text, this.state),
          digits = _this$parser$input.digits,
          justLeadingPlus = _this$parser$input.justLeadingPlus;

      if (justLeadingPlus) {
        this.formattedOutput = '+';
      } else if (digits) {
        this.determineTheCountryIfNeeded(); // Match the available formats by the currently available leading digits.

        if (this.state.nationalSignificantNumber) {
          this.formatter.narrowDownMatchingFormats(this.state);
        }

        var formattedNationalNumber;

        if (this.metadata.hasSelectedNumberingPlan()) {
          formattedNationalNumber = this.formatter.format(digits, this.state);
        }

        if (formattedNationalNumber === undefined) {
          // See if another national (significant) number could be re-extracted.
          if (this.parser.reExtractNationalSignificantNumber(this.state)) {
            this.determineTheCountryIfNeeded(); // If it could, then re-try formatting the new national (significant) number.

            var nationalDigits = this.state.getNationalDigits();

            if (nationalDigits) {
              formattedNationalNumber = this.formatter.format(nationalDigits, this.state);
            }
          }
        }

        this.formattedOutput = formattedNationalNumber ? this.getFullNumber(formattedNationalNumber) : this.getNonFormattedNumber();
      }

      return this.formattedOutput;
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this = this;

      this.state = new AsYouTypeState({
        onCountryChange: function onCountryChange(country) {
          // Before version `1.6.0`, the official `AsYouType` formatter API
          // included the `.country` property of an `AsYouType` instance.
          // Since that property (along with the others) have been moved to
          // `this.state`, `this.country` property is emulated for compatibility
          // with the old versions.
          _this.country = country;
        },
        onCallingCodeChange: function onCallingCodeChange(country, callingCode) {
          _this.metadata.selectNumberingPlan(country, callingCode);

          _this.formatter.reset(_this.metadata.numberingPlan, _this.state);

          _this.parser.reset(_this.metadata.numberingPlan);
        }
      });
      this.formatter = new AsYouTypeFormatter({
        state: this.state,
        metadata: this.metadata
      });
      this.parser = new AsYouTypeParser({
        defaultCountry: this.defaultCountry,
        defaultCallingCode: this.defaultCallingCode,
        metadata: this.metadata,
        state: this.state,
        onNationalSignificantNumberChange: function onNationalSignificantNumberChange() {
          _this.determineTheCountryIfNeeded();

          _this.formatter.reset(_this.metadata.numberingPlan, _this.state);
        }
      });
      this.state.reset(this.defaultCountry, this.defaultCallingCode);
      this.formattedOutput = '';
      return this;
    }
    /**
     * Returns `true` if the phone number is being input in international format.
     * In other words, returns `true` if and only if the parsed phone number starts with a `"+"`.
     * @return {boolean}
     */

  }, {
    key: "isInternational",
    value: function isInternational() {
      return this.state.international;
    }
    /**
     * Returns the "country calling code" part of the phone number.
     * Returns `undefined` if the number is not being input in international format.
     * Returns "country calling code" for "non-geographic" phone numbering plans too.
     * @return {string} [callingCode]
     */

  }, {
    key: "getCallingCode",
    value: function getCallingCode() {
      return this.state.callingCode;
    } // A legacy alias.

  }, {
    key: "getCountryCallingCode",
    value: function getCountryCallingCode() {
      return this.getCallingCode();
    }
    /**
     * Returns a two-letter country code of the phone number.
     * Returns `undefined` for "non-geographic" phone numbering plans.
     * Returns `undefined` if no phone number has been input yet.
     * @return {string} [country]
     */

  }, {
    key: "getCountry",
    value: function getCountry() {
      var _this$state = this.state,
          digits = _this$state.digits,
          country = _this$state.country; // If no digits have been input yet,
      // then `this.country` is the `defaultCountry`.
      // Won't return the `defaultCountry` in such case.

      if (!digits) {
        return;
      }

      var countryCode = country;
      /* istanbul ignore if */

      if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
        // `AsYouType.getCountry()` returns `undefined`
        // for "non-geographic" phone numbering plans.
        if (countryCode === '001') {
          countryCode = undefined;
        }
      }

      return countryCode;
    }
  }, {
    key: "determineTheCountryIfNeeded",
    value: function determineTheCountryIfNeeded() {
      // Suppose a user enters a phone number in international format,
      // and there're several countries corresponding to that country calling code,
      // and a country has been derived from the number, and then
      // a user enters one more digit and the number is no longer
      // valid for the derived country, so the country should be re-derived
      // on every new digit in those cases.
      //
      // If the phone number is being input in national format,
      // then it could be a case when `defaultCountry` wasn't specified
      // when creating `AsYouType` instance, and just `defaultCallingCode` was specified,
      // and that "calling code" could correspond to a "non-geographic entity",
      // or there could be several countries corresponding to that country calling code.
      // In those cases, `this.country` is `undefined` and should be derived
      // from the number. Again, if country calling code is ambiguous, then
      // `this.country` should be re-derived with each new digit.
      //
      if (!this.state.country || this.isCountryCallingCodeAmbiguous()) {
        this.determineTheCountry();
      }
    } // Prepends `+CountryCode ` in case of an international phone number

  }, {
    key: "getFullNumber",
    value: function getFullNumber(formattedNationalNumber) {
      var _this2 = this;

      if (this.isInternational()) {
        var prefix = function prefix(text) {
          return _this2.formatter.getInternationalPrefixBeforeCountryCallingCode(_this2.state, {
            spacing: text ? true : false
          }) + text;
        };

        var callingCode = this.state.callingCode;

        if (!callingCode) {
          return prefix("".concat(this.state.getDigitsWithoutInternationalPrefix()));
        }

        if (!formattedNationalNumber) {
          return prefix(callingCode);
        }

        return prefix("".concat(callingCode, " ").concat(formattedNationalNumber));
      }

      return formattedNationalNumber;
    }
  }, {
    key: "getNonFormattedNationalNumberWithPrefix",
    value: function getNonFormattedNationalNumberWithPrefix() {
      var _this$state2 = this.state,
          nationalSignificantNumber = _this$state2.nationalSignificantNumber,
          complexPrefixBeforeNationalSignificantNumber = _this$state2.complexPrefixBeforeNationalSignificantNumber,
          nationalPrefix = _this$state2.nationalPrefix;
      var number = nationalSignificantNumber;
      var prefix = complexPrefixBeforeNationalSignificantNumber || nationalPrefix;

      if (prefix) {
        number = prefix + number;
      }

      return number;
    }
  }, {
    key: "getNonFormattedNumber",
    value: function getNonFormattedNumber() {
      var nationalSignificantNumberMatchesInput = this.state.nationalSignificantNumberMatchesInput;
      return this.getFullNumber(nationalSignificantNumberMatchesInput ? this.getNonFormattedNationalNumberWithPrefix() : this.state.getNationalDigits());
    }
  }, {
    key: "getNonFormattedTemplate",
    value: function getNonFormattedTemplate() {
      var number = this.getNonFormattedNumber();

      if (number) {
        return number.replace(/[\+\d]/g, DIGIT_PLACEHOLDER);
      }
    }
  }, {
    key: "isCountryCallingCodeAmbiguous",
    value: function isCountryCallingCodeAmbiguous() {
      var callingCode = this.state.callingCode;
      var countryCodes = this.metadata.getCountryCodesForCallingCode(callingCode);
      return countryCodes && countryCodes.length > 1;
    } // Determines the country of the phone number
    // entered so far based on the country phone code
    // and the national phone number.

  }, {
    key: "determineTheCountry",
    value: function determineTheCountry() {
      this.state.setCountry(getCountryByCallingCode(this.isInternational() ? this.state.callingCode : this.defaultCallingCode, this.state.nationalSignificantNumber, this.metadata));
    }
    /**
     * Returns an instance of `PhoneNumber` class.
     * Will return `undefined` if no national (significant) number
     * digits have been entered so far, or if no `defaultCountry` has been
     * set and the user enters a phone number not in international format.
     */

  }, {
    key: "getNumber",
    value: function getNumber() {
      var _this$state3 = this.state,
          nationalSignificantNumber = _this$state3.nationalSignificantNumber,
          carrierCode = _this$state3.carrierCode;

      if (this.isInternational()) {
        if (!this.state.callingCode) {
          return;
        }
      } else {
        if (!this.state.country && !this.defaultCallingCode) {
          return;
        }
      }

      if (!nationalSignificantNumber) {
        return;
      }

      var countryCode = this.getCountry();
      var callingCode = this.getCountryCallingCode() || this.defaultCallingCode;
      var phoneNumber = new PhoneNumber(countryCode || callingCode, nationalSignificantNumber, this.metadata.metadata);

      if (carrierCode) {
        phoneNumber.carrierCode = carrierCode;
      } // Phone number extensions are not supported by "As You Type" formatter.


      return phoneNumber;
    }
    /**
     * Returns `true` if the phone number is "possible".
     * Is just a shortcut for `PhoneNumber.isPossible()`.
     * @return {boolean}
     */

  }, {
    key: "isPossible",
    value: function isPossible() {
      var phoneNumber = this.getNumber();

      if (!phoneNumber) {
        return false;
      }

      return phoneNumber.isPossible();
    }
    /**
     * Returns `true` if the phone number is "valid".
     * Is just a shortcut for `PhoneNumber.isValid()`.
     * @return {boolean}
     */

  }, {
    key: "isValid",
    value: function isValid() {
      var phoneNumber = this.getNumber();

      if (!phoneNumber) {
        return false;
      }

      return phoneNumber.isValid();
    }
    /**
     * @deprecated
     * This method is used in `react-phone-number-input/source/input-control.js`
     * in versions before `3.0.16`.
     */

  }, {
    key: "getNationalNumber",
    value: function getNationalNumber() {
      return this.state.nationalSignificantNumber;
    }
    /**
     * Returns the phone number characters entered by the user.
     * @return {string}
     */

  }, {
    key: "getChars",
    value: function getChars() {
      return (this.state.international ? '+' : '') + this.state.digits;
    }
    /**
     * Returns the template for the formatted phone number.
     * @return {string}
     */

  }, {
    key: "getTemplate",
    value: function getTemplate() {
      return this.formatter.getTemplate(this.state) || this.getNonFormattedTemplate() || '';
    }
  }]);

  return AsYouType;
}();

export { AsYouType as default };
//# sourceMappingURL=AsYouType.js.map