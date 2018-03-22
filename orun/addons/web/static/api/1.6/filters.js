(function () {
  const uiKatrid = Katrid.uiKatrid;

  uiKatrid.filter('numberFormat', () => {
    return (value, maxDigits = 3) => {
      return new Intl.NumberFormat('pt-br', { maximumSignificantDigits: maxDigits }).format(value);
    }
  });

})();