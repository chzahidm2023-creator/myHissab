export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "";

  let parsedDate;

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    parsedDate = new Date(year, month - 1, day);
  } else {
    parsedDate = new Date(date);
  }

  if (isNaN(parsedDate.getTime())) return "";

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  const formats = {
    "MM/DD/YYYY": `${month}/${day}/${year}`,
    "DD/MM/YYYY": `${day}/${month}/${year}`,
    "YYYY-MM-DD": `${year}-${month}-${day}`,
    "DD-MM-YYYY": `${day}-${month}-${year}`,
  };

  return formats[format] || formats["DD/MM/YYYY"];
};
