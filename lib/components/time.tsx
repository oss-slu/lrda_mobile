import React, { useState } from "react";
import { View, Text, Button, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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

export default function LocationWindow({ time, setTime }: { time: Date; setTime: React.Dispatch<React.SetStateAction<Date>> }) {
  const [date] = useState(time);
  const [chosenDate, setChosenDate] = useState(new Date());
  const [chosenTime, setChosenTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savedDateTime, setSavedDateTime] = useState<null | Date>(null);
  const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);

  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowDatePicker(false);
      } else {
        setChosenDate(currentDate);
        setShowDatePicker(false);
        setIsDateTimeSelected(true);
      }
    } else {
      setChosenDate(currentDate);
    }
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    const currentTime = selectedTime || time;

    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowTimePicker(false);
      } else {
        setChosenTime(currentTime);
        setShowTimePicker(false);
        setShowDatePicker(true);
      }
    } else {
      setChosenTime(currentTime);
    }
  };

  const saveDateTime = () => {
    const combinedDate = new Date(
      chosenDate.getFullYear(),
      chosenDate.getMonth(),
      chosenDate.getDate(),
      chosenTime.getHours(),
      chosenTime.getMinutes()
    );
    setTime(combinedDate);
    setSavedDateTime(combinedDate);
    setShowPicker(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsDateTimeSelected(false);
  };

  return (
    <View className="h-[110px] items-center justify-center p-5">
      <Text className="mb-[1px] font-inter text-lg font-bold">Date & Time</Text>
      {showPicker ? (
        <View className={Platform.OS === "ios" ? "flex-row" : "flex-col"}>
          {showDatePicker && (
            <DateTimePicker testID="datePicker" value={chosenDate} mode="date" is24Hour={true} display="default" onChange={onChangeDate} />
          )}
          {showTimePicker && (
            <DateTimePicker testID="timePicker" value={chosenTime} mode="time" is24Hour={true} display="default" onChange={onChangeTime} />
          )}
          {isDateTimeSelected && Platform.OS === "android" && (
            <Text className="mb-2.5 text-center font-inter text-base">
              Selected:{" "}
              {formatToLocalDateString(
                new Date(
                  chosenDate.getFullYear(),
                  chosenDate.getMonth(),
                  chosenDate.getDate(),
                  chosenTime.getHours(),
                  chosenTime.getMinutes()
                )
              )}
            </Text>
          )}
          <View className="flex-col items-center">
            <Button title="Save" onPress={saveDateTime} testID="Save" />
          </View>
        </View>
      ) : (
        <View>
          <View className="mt-2.5 items-center">
            <Text className="font-inter text-base">{formatToLocalDateString(savedDateTime || time)}</Text>
          </View>
          <Button
            title="Select Date & Time"
            onPress={() => {
              setShowPicker(true);
              setShowDatePicker(Platform.OS === "ios");
              setShowTimePicker(true);
            }}
          />
        </View>
      )}
    </View>
  );
}
