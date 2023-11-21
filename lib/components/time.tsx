import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet ,Button, Platform} from "react-native";
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

export default function LocationWindow({
  time,
  setTime,
}: {
  time: Date;
  setTime: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const [date, setDate] = useState(new Date());
  const [chosenDate, setChosenDate] = useState(new Date());
  const [chosenTime, setChosenTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savedDateTime, setSavedDateTime] = useState<null | Date>(null);
  const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);

  useEffect(() => {
    setDate(time);
  }, []);

  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setChosenDate(currentDate);
    if (Platform.OS === 'android') {
      setShowDatePicker(false); 
      setShowTimePicker(false); 
      setIsDateTimeSelected(true);
    }
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    const currentTime = selectedTime || time;
  
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowTimePicker(false); 
      } else {
        setChosenTime(currentTime);
        setShowTimePicker(false); 
        setShowDatePicker(true); 
      }
    } else {
      setChosenTime(currentTime);
      setIsDateTimeSelected(true);
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
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.label}>Date & Time</Text>
      {showPicker ? (
        <View style={Platform.OS === 'ios' ? styles.IOSdateTimePickerContainer : styles.dateTimePickerContainer}>
    {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={chosenDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
            />
          )}
    {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={chosenTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeTime}
            />
          )}
        {isDateTimeSelected && Platform.OS === 'android' && (
        <Text style={styles.selectedDateTimeLabel}>
          Selected: {formatToLocalDateString(new Date(chosenDate.getFullYear(), chosenDate.getMonth(), chosenDate.getDate(), chosenTime.getHours(), chosenTime.getMinutes()))}
        </Text>
      )}
      <View style={styles.button}>
       <Button title="Save" onPress={saveDateTime}/>
      </View>
    </View>
) : (
  <View>
    <View style={styles.savedTimeContainer}>
      <Text style={styles.savedTime}>
        {formatToLocalDateString(savedDateTime || time)}
      </Text>
    </View>
    <Button title="Select Date & Time" onPress={() => { setShowPicker(true); setShowDatePicker(Platform.OS === 'ios'); setShowTimePicker(true); }} />
  </View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 1,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%", 
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  IOSdateTimePickerContainer: {
    flexDirection: "row", 
  },
  dateTimePickerContainer: {
    flexDirection: "column", 
  },
  savedTimeContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  savedTime: {
    fontSize: 16,
  },
  selectedDateTimeLabel: {
    marginBottom: 10, 
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    flexDirection: "column", 
    alignItems: "center",
  },
});
