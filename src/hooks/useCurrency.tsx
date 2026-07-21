import { useState, useMemo } from "react";
import { CURRENCIES } from "../data/constants";
import { makeFmt } from "../utils/helper";

export function useCurrency() {
  const [currency, setCurrencyState] = useState(CURRENCIES[0]);
  const fmt = useMemo(() => makeFmt(currency), [currency]);

  const ctxValue = useMemo(
    () => ({ currency, setCurrency: setCurrencyState, fmt }),
    [currency, fmt],
  );

  return ctxValue;
}
