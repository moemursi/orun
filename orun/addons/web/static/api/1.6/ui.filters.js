(function () {
  const uiKatrid = Katrid.uiKatrid;

  uiKatrid.filter('numberFormat', () => {
    return (value, maxDigits = 3) => {
      if (value == null)
        return '';
      return new Intl.NumberFormat('pt-br', { maximumSignificantDigits: maxDigits }).format(value);
    }
  });

})();