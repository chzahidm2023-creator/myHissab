import { useSelector } from "react-redux";
import { useCallback } from "react";
import { formatDate } from "../../utils/formatDate";

export const useDateFormat = () => {
  const dateFormat = useSelector(
    (state) => state.businessSettings.settings?.systemPreferences?.dateFormat,
  );

  return useCallback((date) => formatDate(date, dateFormat), [dateFormat]);
};
