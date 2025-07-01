import React, { useState } from 'react';
import { Buffer } from "buffer";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform, Dimensions,
} from 'react-native';


interface Part {
    part_id: number;
    part_name: string;
    unit_price: number;
}

interface TravelSuggestion {
    location: string;
    travel_time_hours: number;
}

import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/AddWorkOrdersform.styles';
import WeekCounter from '../app/weekcounter';
import DateTimePicker from '@react-native-community/datetimepicker';

function getCustomCalendarWeekNumber(): number {
    const anchorDate = new Date('2023-01-09'); // Monday before Jan 11, 2023
    const today = new Date();
    anchorDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const msInDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.floor((today.getTime() - anchorDate.getTime()) / msInDay);
    return Math.floor(diffInDays / 7) + 1;
}

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

const getWeekNumber = (): number => {
    const today = new Date();
    const oneJan = new Date(today.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((today.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((today.getDay() + 1 + numberOfDays) / 7);
};

const AddWorkOrderForm = ({
                              visible,
                              onClose,
                              technicianName,
                          }: {
    visible: boolean;
    onClose: () => void;
    technicianName: string;

}) => {
    const [jobDescription, setJobDescription] = useState('');
    const [workPerformed, setworkPerformed] = useState('');
    const [jobHeight, setJobHeight] = useState(40);
    const [date] = useState(getTodayDate());
    const [travelLocation, setTravelLocation] = useState('');
    const [travelHours, setTravelHours] = useState('');
    const [travelSuggestions, setTravelSuggestions] = useState<TravelSuggestion[]>([]);
    const [showTravelDropdown, setShowTravelDropdown] = useState(false);
    const [parts, setParts] = useState([{ name: '', unit_price: '', quantity: '1' }]);
    const [partSuggestions, setPartSuggestions] = useState<{ [key: number]: Part[] }>({});
    const [showSuggestions, setShowSuggestions] = useState<{ [key: number]: boolean }>({});
    const [workOrderNumber, setWorkOrderNumber] = useState('');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
    const [customer, setCustomer] = useState('');
    const [siteAddress, setSiteAddress] = useState('');
    const [siteContact, setSiteContact] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [weekNumber, setWeekNumber] = useState(getCustomCalendarWeekNumber().toString());



    const handleCancel = () => {
        setTravelLocation('');
        setTravelHours('');
        setParts([{ name: '', unit_price: '', quantity: '1' }]);
        onClose();
    };

    const handleTravelChange = async (text: string) => {
        setTravelLocation(text);
        if (text.length > 0) {
            try {
                const response = await fetch(`http://10.0.0.63:8000/travel-time/?location=${text}`);
                const data = await response.json();
                setTravelSuggestions(data);
                setShowTravelDropdown(true);
            } catch (error) {
                console.error(error);
                setTravelSuggestions([]);
                setShowTravelDropdown(false);
            }
        } else {
            setShowTravelDropdown(false);
        }
    };

    const handleSelectTravelLocation = (item: TravelSuggestion) => {
        setTravelLocation(item.location || '');
        if (typeof item.travel_time_hours === 'number') {
            setTravelHours(item.travel_time_hours.toString());
        } else {
            setTravelHours('');
            console.warn('No travel_time_hours value found for selected location');
        }
        setShowTravelDropdown(false);
    };

    const handleAddPart = () => {
        setParts([...parts, { name: '', unit_price: '', quantity: '1' }]);
    };

    const handleRemovePart = (index: number) => {
        const updated = parts.filter((_, i) => i !== index);
        setParts(updated);
    };

    const handlePartChange = async (text: string, index: number) => {
        const updated = [...parts];
        updated[index].name = text;
        setParts(updated);
        if (text.length > 0) {
            try {
                const response = await fetch(`http://10.0.0.63:8000/parts/?part_name=${text}`);
                const data = await response.json();
                setPartSuggestions((prev) => ({ ...prev, [index]: data }));
                setShowSuggestions((prev) => ({ ...prev, [index]: true }));
            } catch (error) {
                console.error(error);
            }
        } else {
            setPartSuggestions((prev) => ({ ...prev, [index]: [] }));
            setShowSuggestions((prev) => ({ ...prev, [index]: false }));
        }
    };

    const handleSelectPart = (item: Part, index: number) => {
        const updated = [...parts];
        updated[index].name = item.part_name;
        updated[index].unit_price = item.unit_price.toFixed(2);
        setParts(updated);
        setShowSuggestions((prev) => ({ ...prev, [index]: false }));
    };

    const handleQuantityChange = (value: string, index: number) => {
        const updated = [...parts];
        updated[index].quantity = value;
        setParts(updated);
    };

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const calculateTotalCost = (): string => {
        const total = parts.reduce((sum, part) => {
            const price = parseFloat(part.unit_price || '0');
            const qty = parseInt(part.quantity || '0');
            return sum + price * qty;
        }, 0);
        return total.toFixed(2);
    };

    const [jobStatus, setJobStatus] = useState<string>(''); // at the top of your component

    const jobStatusOptions = [
        'Job Complete',
        'Temporary Repairs',
        'Maintenance Problems',
        'Safety Issues Repairs Required',
    ];

    const [hotWorkPermit, setHotWorkPermit] = useState<string>('');
    const [orientation, setOrientation] = useState<string>('');

    const [inTime, setInTime] = useState<Date | null>(null);
    const [outTime, setOutTime] = useState<Date | null>(null);
    const [showInTimePicker, setShowInTimePicker] = useState(false);
    const [showOutTimePicker, setShowOutTimePicker] = useState(false);


    const formatTime = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSubmit = async () => {
        const folderName = `${new Date().toLocaleDateString("en-CA", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }).replace(/-/g, "").slice(0, 8)}_${workOrderNumber}`;

        // Calculate total before tax
        const totalBeforeTax = parts.reduce((sum, part) => {
            const price = parseFloat(part.unit_price || '0');
            const qty = parseInt(part.quantity || '0');
            return sum + price * qty;
        }, 0).toFixed(2);

        // Calculate tax amount (13% HST/GST)
        const taxAmount = (parseFloat(totalBeforeTax) * 0.13).toFixed(2);

        // Calculate total after tax
        const totalAfterTax = (parseFloat(totalBeforeTax) + parseFloat(taxAmount)).toFixed(2);

        // Map parts to include total per part
        const updatedParts = parts.map(part => ({
            ...part,
            total_price: (parseFloat(part.unit_price || '0') * parseInt(part.quantity || '0')).toFixed(2),
        }));

        const payload = {
            technician: technicianName,
            date: date,
            inTime: formatTime(inTime),
            outTime: formatTime(outTime),
            workOrderNumber,
            purchaseOrderNumber,
            customer,
            siteAddress,
            travelLocation,
            travelHours,
            siteContact,
            phoneNumber,
            jobDescription,
            workPerformed,
            parts: updatedParts,
            totalBeforeTax,
            taxAmount,      // ✅ added tax amount field
            totalAfterTax,
            jobStatus,
            orientation,
            hotWorkPermit,
            week: weekNumber,
        };

        try {
            // Fetch dummy PDF
            const pdfRes = await fetch("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            const pdfBlob = await pdfRes.blob();

            // JSON file blob
            const jsonBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });

            // FormData
            const formData = new FormData();
            formData.append("folder_name", folderName);
            formData.append("json_data", JSON.stringify(payload));
            formData.append("pdf_file", pdfBlob, "workorder.pdf");

            // Send to server
            const res = await fetch("http://10.0.0.63:8000/create-workorder/", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Work order uploaded!");
                onClose();
            } else {
                const errorText = await res.text();
                console.error("Upload failed:", errorText);
                alert("Upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Network or file error.");
        }
    };




    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={80} // adjust if header or status bar causes offset
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }} // avoids white bar
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
            >
                <Text style={styles.heading}>New Work Order</Text>

                {/* Initial Fields */}
                <Text style={styles.label}>Technician</Text>
                <TextInput value={technicianName} style={styles.input} editable={false} />

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>Date</Text>
                        <TextInput value={date} style={styles.input} editable={false} />
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>Week</Text>
                        <TextInput
                            value={weekNumber}
                            style={styles.input}
                            editable={false}
                        />

                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>In Time</Text>
                        <TouchableOpacity
                            onPress={() => setShowInTimePicker(true)}
                            style={styles.timeInputWrapper}
                        >
                            <Text style={styles.timeInputText}>
                                {inTime ? formatTime(inTime) : 'Select time'}
                            </Text>
                        </TouchableOpacity>
                        {showInTimePicker && (
                            // @ts-ignore
                            <DateTimePicker
                                mode="time"
                                value={inTime || new Date()}
                                display="compact"
                                minuteInterval={1}
                                onChange={(event: any, selectedDate?: Date) => {
                                    setShowInTimePicker(false);
                                    if (selectedDate) setInTime(selectedDate);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.half}>
                        <Text style={styles.label}>Out Time</Text>
                        <TouchableOpacity
                            onPress={() => setShowOutTimePicker(true)}
                            style={styles.timeInputWrapper}
                        >
                            <Text style={styles.timeInputText}>
                                {outTime ? formatTime(outTime) : 'Select time'}
                            </Text>
                        </TouchableOpacity>
                        {showOutTimePicker && (
                            // @ts-ignore
                            <DateTimePicker
                                mode="time"
                                value={outTime || new Date()}
                                display="compact"
                                minuteInterval={1}
                                onChange={(event: any, selectedDate?: Date) => {
                                    setShowOutTimePicker(false);
                                    if (selectedDate) setOutTime(selectedDate); // ✅ This is the fix
                                }}
                            />
                        )}
                    </View>
                </View>




                {/* Work Info */}
                <Text style={styles.section}>Work Info</Text>

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>WO #</Text>
                        <View style={{ position: 'relative' }}>
                            <TextInput placeholder="eg. 0200720"
                                       placeholderTextColor="#9ca3af" // light gray
                                       style={styles.input}
                                       keyboardType="numeric"
                                       value={workOrderNumber}
                                       onChangeText={setWorkOrderNumber}

                            />
                        </View>
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>PO #</Text>
                        <TextInput
                            placeholder="eg. 0000611"
                            placeholderTextColor="#9ca3af"
                            style={styles.input}
                            keyboardType="numeric"
                            value={purchaseOrderNumber}
                            onChangeText={setPurchaseOrderNumber}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Customer</Text>
                <TextInput placeholder="eg. Black & McDonald"
                           placeholderTextColor="#9ca3af"
                           style={styles.input}
                           editable={true}
                           value={customer}
                           onChangeText={setCustomer}

                />

                <Text style={styles.label}>Site Address</Text>
                <TextInput placeholder="eg. 500 Comissioner St."
                           placeholderTextColor="#9ca3af"
                           style={styles.input}
                           editable={true}
                           value={siteAddress}
                           onChangeText={setSiteAddress}
                />


                {/* Travel Time Computation */}
                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>Location</Text>
                        <View style={{ position: 'relative' }}>
                            <TextInput
                                value={travelLocation}
                                onChangeText={handleTravelChange}
                                placeholder="eg. Downtown Toronto"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                            />
                            {showTravelDropdown && travelSuggestions.length > 0 && (
                                <View style={styles.dropdown}>
                                    {travelSuggestions.map((item, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectTravelLocation(item)}
                                        >
                                            <Text numberOfLines={1}>{item.location}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>Hours</Text>
                        <TextInput
                            value={travelHours}
                            onChangeText={setTravelHours}
                            placeholder="eg. 1.5"
                            placeholderTextColor="#9ca3af"
                            style={styles.input}
                        />
                    </View>
                </View>


                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>Site Contact</Text>
                        <TextInput placeholder="eg. Maria Labeeba"
                                   placeholderTextColor="#9ca3af"
                                   style={styles.input}
                                   editable={true}
                                   value={siteContact}
                                   onChangeText={setSiteContact}
                        />
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>Phone #</Text>
                        <TextInput
                            placeholder="eg. 647712r6552"
                            placeholderTextColor="#9ca3af"
                            style={styles.input}
                            keyboardType="numeric"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>
                </View>

                {/* Job Description */}
                <Text style={styles.section}>Job Description</Text>
                <Text style={styles.label}>Work Details</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            minHeight: 60,              // ≈ 3 lines
                            textAlignVertical: 'top',  // start from top
                        },
                    ]}
                    placeholder="eg. - Blowing Fuse"
                    placeholderTextColor="#9ca3af"
                    editable={true}
                    multiline={true}
                    blurOnSubmit={false}           // ✅ enables new line on return
                    scrollEnabled={false}          // ✅ prevents scroll and lets height expand
                    value={jobDescription}
                    onChangeText={setJobDescription}
                />

                <Text style={styles.label}>Work Performed</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            minHeight: 60,              // ≈ 3 lines
                            textAlignVertical: 'top',  // start from top
                        },
                    ]}
                    placeholder="eg. - Replaced Fuse"
                    placeholderTextColor="#9ca3af"
                    editable={true}
                    multiline={true}
                    blurOnSubmit={false}           // ✅ enables new line on return
                    scrollEnabled={false}          // ✅ prevents scroll and lets height expand
                    value={workPerformed}
                    onChangeText={setworkPerformed}
                />

                {/* Parts List Implementation */}
                <Text style={styles.section}>Parts</Text>
                {parts.map((part, index) => (
                    <View key={index} style={styles.partWrapper}>
                        <View style={styles.partHeader}>
                            <Text style={styles.partIndex}>{index + 1}.</Text>
                            <View style={styles.partInputWrapper}>
                                <TextInput
                                    style={styles.partInput}
                                    placeholder="Enter part"
                                    placeholderTextColor="#9ca3af"
                                    value={part.name}
                                    onChangeText={(text) => handlePartChange(text, index)}
                                />
                                {showSuggestions[index] && partSuggestions[index]?.length > 0 && (
                                    <View style={styles.dropdown}>
                                        {partSuggestions[index].map((item) => (
                                            <TouchableOpacity
                                                key={item.part_id}
                                                style={styles.suggestionItem}
                                                onPress={() => handleSelectPart(item, index)}
                                            >
                                                <Text numberOfLines={1}>{item.part_name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.priceRow}>
                            <View style={styles.costWrapper}>
                                <Text style={styles.dollarSign}>$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    editable={false}
                                    value={part.unit_price}
                                />
                            </View>
                            <Text style={styles.quantityTitle}> X </Text>
                            <TextInput
                                style={styles.quantityInput}
                                keyboardType="numeric"
                                value={part.quantity}
                                onChangeText={(value) => handleQuantityChange(value, index)}
                            />
                            <Text style={styles.quantityTitle}> = </Text>
                            <Text style={styles.dollarSign}>$</Text>
                            <TextInput
                                style={styles.priceInput}
                                editable={false}
                                value={(
                                    parseFloat(part.unit_price || '0') * parseInt(part.quantity || '1')
                                ).toFixed(2)}
                            />
                            <TouchableOpacity onPress={() => handleRemovePart(index)}>
                                <Text style={styles.removeBtn}>−</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity onPress={handleAddPart}>
                    <Text style={styles.addBtn}>+ Add</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 10, alignItems: 'flex-end', paddingRight: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                        Net Cost: ${calculateTotalCost()}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                        HST/GST: ${(parseFloat(calculateTotalCost()) * 0.13).toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5}}>
                        Total Cost: ${(parseFloat(calculateTotalCost()) * 1.13).toFixed(2)}
                    </Text>

                </View>


                {/* Other */}
                <Text style={styles.section}>Job Status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
                    {jobStatusOptions.map((option) => {
                        const isSelected = jobStatus === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                onPress={() => setJobStatus(isSelected ? '' : option)}
                                style={{
                                    width: '48%',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? '#e0f0ff' : '#f5f5f5',
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? '#007aff' : '#ddd',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: isSelected ? 2 : 1,
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: isSelected ? '#007aff' : '#333',

                                    }}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Orientation */}
                <Text style={styles.section}>Orientation</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {['Yes', 'No'].map((option) => {
                        const isSelected = orientation === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                onPress={() => setOrientation(isSelected ? '' : option)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? '#e0f7ec' : '#f5f5f5',
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? '#00aa77' : '#ccc',
                                }}
                            >
                                <Text style={{ textAlign: 'center', fontWeight: '500', color: isSelected ? '#00aa77' : '#333' }}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.section}>Hot Work Permit</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {['Yes', 'No'].map((option) => {
                        const isSelected = hotWorkPermit === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                onPress={() => setHotWorkPermit(isSelected ? '' : option)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? '#e0f7ec' : '#f5f5f5',
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? '#00aa77' : '#ccc',
                                }}
                            >
                                <Text style={{ textAlign: 'center', fontWeight: '500', color: isSelected ? '#00aa77' : '#333' }}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );

                    })}
                </View>



                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>

                </View>


            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddWorkOrderForm;
