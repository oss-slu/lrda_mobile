export function formatToLocalDateString(date: Date): string {
  const localTime = new Date(date);
  const currentDate = new Date();
  const localTimeOffset = localTime.getTimezoneOffset() / 60;
  const offsetInHours = currentDate.getTimezoneOffset() / 60;
  if (localTimeOffset !== offsetInHours) {
    localTime.setHours(localTime.getHours() - offsetInHours);
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = localTime.toLocaleDateString("en-US", dateOptions);
  const formattedTime = localTime.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate}\n${formattedTime}`;
}
