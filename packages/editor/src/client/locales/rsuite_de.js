'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _extends2 = _interopRequireDefault(require('@babel/runtime/helpers/extends'))

var Calendar = {
  sunday: 'So',
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
  ok: 'Ok',
  today: 'Heute',
  yesterday: 'Gestern',
  hours: 'Stunden',
  minutes: 'Minuten',
  seconds: 'Sekunden',

  /**
   * Format of the string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   **/
  formattedMonthPattern: 'MMM YYYY',
  formattedDayPattern: 'DD MMM YYYY'
}
var _default = {
  Pagination: {
    more: 'Mehr',
    prev: 'Vorherige',
    next: 'Nächste',
    first: 'Erste',
    last: 'Letzte'
  },
  Table: {
    emptyMessage: 'Keine daten',
    loading: 'Laden...'
  },
  TablePagination: {
    lengthMenuInfo: '{0} / Seiten',
    totalInfo: 'Total: {0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: 'Letzten 7 Tage'
  }),
  Picker: {
    noResultsText: 'Es wurden keine Resultate gefunden',
    placeholder: 'Placeholder',
    searchPlaceholder: 'Suchen',
    checkAll: 'Alle'
  },
  InputPicker: {
    newItem: 'Neu',
    createOption: 'Option erzeugen "{0}"'
  },
  Uploader: {
    inited: 'Initial',
    progress: 'Vortschritt',
    error: 'Fehler',
    complete: 'Fertig',
    emptyFile: 'Leer',
    upload: 'Hochladen'
  }
}
exports.default = _default
module.exports = exports.default
