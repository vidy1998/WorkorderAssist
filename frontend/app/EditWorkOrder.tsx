import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/AddWorkOrdersform.styles';
import {useNavigation} from '@react-navigation/native';
import {router} from "expo-router";


type EditWorkOrderRouteParams = {
    folderName: string;
    workOrderNumber: string;
};


const EditWorkOrderForm = () => {
    const route = useRoute<RouteProp<Record<string, EditWorkOrderRouteParams>, string>>();
    const {folderName} = route.params;
    const navigation = useNavigation();

    const [technician, setTechnician] = useState('');
    const [date, setDate] = useState('');
    const [weekNumber, setWeekNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [inTime, setInTime] = useState<Date | null>(null);
    const [outTime, setOutTime] = useState<Date | null>(null);
    const [showInTimePicker, setShowInTimePicker] = useState(false);
    const [showOutTimePicker, setShowOutTimePicker] = useState(false);
    const [workOrderNumber, setWorkOrderNumber] = useState('');
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
    const [customer, setCustomer] = useState('');
    const [siteAddress, setSiteAddress] = useState('');
    const [travelLocation, setTravelLocation] = useState('');
    const [travelHours, setTravelHours] = useState('');
    const [travelSuggestions, setTravelSuggestions] = useState<any[]>([]);
    const [showTravelDropdown, setShowTravelDropdown] = useState(false);
    const [siteContact, setSiteContact] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [workPerformed, setWorkPerformed] = useState('');
    const [parts, setParts] = useState([{name: '', unit_price: '', quantity: '1'}]);
    const [partSuggestions, setPartSuggestions] = useState<{ [key: number]: any[] }>({});
    const [showSuggestions, setShowSuggestions] = useState<{ [key: number]: boolean }>({});
    const [jobStatus, setJobStatus] = useState('');
    const [orientation, setOrientation] = useState('');
    const [hotWorkPermit, setHotWorkPermit] = useState('');


    useEffect(() => {
        const fetchWorkOrder = async () => {
            try {
                const response = await fetch(`http://10.0.0.63:8000/workorder/${folderName}`);
                if (!response.ok) {
                    console.error(`Server error: ${response.status}`);
                    return;
                }

                const data = await response.json();
                console.log('Fetched workorder data:', data);

                // Defensive assignment with fallbacks
                setTechnician(data.technician ?? '');
                setDate(data.date ?? '');
                setWeekNumber(data.week ?? getCustomCalendarWeekNumber().toString());
                setInTime(parseTimeString(data.inTime));
                setOutTime(parseTimeString(data.outTime));
                setWorkOrderNumber(data.workOrderNumber ?? '');
                setPurchaseOrderNumber(data.purchaseOrderNumber ?? '');
                setCustomer(data.customer ?? '');
                setSiteAddress(data.siteAddress ?? '');
                setTravelLocation(data.travelLocation ?? '');
                setTravelHours(data.travelHours?.toString() ?? '');
                setSiteContact(data.siteContact ?? '');
                setPhoneNumber(data.phoneNumber ?? '');
                setJobDescription(data.jobDescription ?? '');
                setWorkPerformed(data.workPerformed ?? '');
                setParts(data.parts && Array.isArray(data.parts) ? data.parts : [{name: '', unit_price: '', quantity: '1'}]);
                setJobStatus(data.jobStatus ?? '');
                setOrientation(data.orientation ?? '');
                setHotWorkPermit(data.hotWorkPermit ?? '');

            } catch (error) {
                console.error('Error fetching workorder:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkOrder();
    }, [folderName]);



    const jobStatusOptions = [
        'Job Complete',
        'Temporary Repairs',
        'Maintenance Problems',
        'Safety Issues Repairs Required',
    ];

    const calculateTotalCost = (): string => {
        const total = parts.reduce((sum, part) => {
            const price = parseFloat(part.unit_price || '0');
            const qty = parseInt(part.quantity || '0');
            return sum + price * qty;
        }, 0);
        return total.toFixed(2);
    };


    const handlePartChange = async (text: string, index: number) => {
        const updated = [...parts];
        updated[index].name = text;
        setParts(updated);

        if (text.length > 0) {
            try {
                const response = await fetch(`http://10.0.0.63:8000/parts/?part_name=${text}`);
                const data = await response.json();
                setPartSuggestions((prev) => ({...prev, [index]: data}));
                setShowSuggestions((prev) => ({...prev, [index]: true}));
            } catch (error) {
                console.error(error);
            }
        } else {
            setPartSuggestions((prev) => ({...prev, [index]: []}));
            setShowSuggestions((prev) => ({...prev, [index]: false}));
        }
    };

    const handleSelectPart = (item: any, index: number) => {
        const updated = [...parts];
        updated[index].name = item.part_name;
        updated[index].unit_price = item.unit_price.toFixed(2);
        setParts(updated);
        setShowSuggestions((prev) => ({...prev, [index]: false}));
    };

    const handleQuantityChange = (value: string, index: number) => {
        const updated = [...parts];
        updated[index].quantity = value;
        setParts(updated);
    };

    const handleAddPart = () => {
        setParts([...parts, {name: '', unit_price: '', quantity: '1'}]);
    };

    const handleRemovePart = (index: number) => {
        const updated = parts.filter((_, i) => i !== index);
        setParts(updated);
    };

    const handleUpdate = async () => {
        try {
            // Map parts to include total per part
            const updatedParts = parts.map(part => ({
                ...part,
                total_price: (parseFloat(part.unit_price || '0') * parseInt(part.quantity || '0')).toFixed(2),
            }));

            // Calculate total before tax
            const totalBeforeTax = updatedParts.reduce((sum, part) => {
                return sum + parseFloat(part.total_price || '0');
            }, 0).toFixed(2);

            // Calculate tax amount (13% HST/GST)
            const taxAmount = (parseFloat(totalBeforeTax) * 0.13).toFixed(2);

            // Calculate total after tax
            const totalAfterTax = (parseFloat(totalBeforeTax) + parseFloat(taxAmount)).toFixed(2);

            const payload = {
                technician,
                date,
                week: weekNumber,
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
                taxAmount,
                totalAfterTax,
                jobStatus,
                orientation,
                hotWorkPermit,
            };

            const formData = new FormData();
            formData.append('folder_name', folderName);
            formData.append('updated_json', JSON.stringify(payload));

            const response = await fetch('http://10.0.0.63:8000/workorder/', {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                alert('Work order updated!');
                router.back(); // ✅ returns to existing ViewWorkOrder
            } else {
                const errorText = await response.text();
                console.error('Update failed:', errorText);
                alert('Update failed.');
            }
        } catch (error) {
            console.error('Error updating workorder:', error);
            alert('An error occurred.');
        }
    };




    const handleTravelChange = async (text: string) => {
        setTravelLocation(text);
        if (text.length > 0) {
            try {
                const response = await fetch(`http://10.0.0.63:8000/travel-time/?location=${text}`);
                const data = await response.json();
                setTravelSuggestions(data);
                setShowTravelDropdown(true);

                // ✅ If only one result and it's an exact match, auto-set hours
                if (data.length === 1 && data[0].location.toLowerCase() === text.toLowerCase()) {
                    setTravelHours(data[0].hours ? data[0].hours.toString() : '');
                    setShowTravelDropdown(false);
                }

            } catch (error) {
                console.error(error);
                setTravelSuggestions([]);
                setShowTravelDropdown(false);
            }
        } else {
            setShowTravelDropdown(false);
        }
    };

    const formatTime = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const handleSelectTravelLocation = (item: any) => {
        setTravelLocation(item.location || '');
        if (typeof item.travel_time_hours === 'number') {
            setTravelHours(item.travel_time_hours.toString());
        } else if (item.hours) {
            // If your API returns 'hours' instead of 'travel_time_hours' in Edit context
            setTravelHours(item.hours.toString());
        } else {
            setTravelHours('');
            console.warn('No hours value found for selected location');
        }
        setShowTravelDropdown(false);
    };


    function parseTimeString(timeStr: string): Date | null {
        if (!timeStr) return null;

        const date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);

        // Handle AM/PM format like '2:48 PM'
        const ampmRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
        const match = timeStr.match(ampmRegex);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const modifier = match[3].toUpperCase();

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            date.setHours(hours);
            date.setMinutes(minutes);
            return date;
        }

        // Handle HH:MM format
        const hmRegex = /^(\d{1,2}):(\d{2})$/;
        const matchHM = timeStr.match(hmRegex);
        if (matchHM) {
            const hours = parseInt(matchHM[1], 10);
            const minutes = parseInt(matchHM[2], 10);

            if (isNaN(hours) || isNaN(minutes)) return null;

            date.setHours(hours);
            date.setMinutes(minutes);
            return date;
        }

        return null; // unrecognized format
    }

    function getCustomCalendarWeekNumber(): number {
        const anchorDate = new Date('2023-01-09');
        const today = new Date();
        anchorDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const msInDay = 1000 * 60 * 60 * 24;
        const diffInDays = Math.floor((today.getTime() - anchorDate.getTime()) / msInDay);
        return Math.floor(diffInDays / 7) + 1;
    }

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 5,
                borderBottomWidth: 1,
                borderColor: '#ddd',

            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{color: '#007aff', fontSize: 16}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdate}>
                    <Text style={{color: '#007aff', fontSize: 16}}>Update</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{flex: 1}}
                keyboardVerticalOffset={80}
            >
                <ScrollView
                    contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 100}}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.heading}>Edit Work Order {workOrderNumber}</Text>

                    {/* Technician Name */}
                    <Text style={styles.label}>Technician</Text>
                    <TextInput
                        value={technician}
                        onChangeText={setTechnician}
                        style={styles.input}
                    />

                    {/* Date */}
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Date</Text>
                            <TextInput
                                value={date}
                                onChangeText={setDate}
                                style={styles.input}
                            />
                        </View>

                        {/* Week */}
                        <View style={styles.half}>
                            <Text style={styles.label}>Week</Text>
                            <TextInput
                                value={weekNumber}
                                onChangeText={setWeekNumber}
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Enter week number"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    {/* In Time */}
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

                        {/* Out Time */}
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
                                <DateTimePicker
                                    mode="time"
                                    value={outTime || new Date()}
                                    display="compact"
                                    minuteInterval={1}
                                    onChange={(event: any, selectedDate?: Date) => {
                                        setShowOutTimePicker(false);
                                        if (selectedDate) setOutTime(selectedDate);
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
                            <View style={{position: 'relative'}}>
                                <TextInput
                                    placeholder="eg. 0200720"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={workOrderNumber}
                                    onChangeText={(text) => setWorkOrderNumber(text)}
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
                                onChangeText={(text) => setPurchaseOrderNumber(text)}
                            />
                        </View>
                    </View>

                    {/* Customer */}
                    <Text style={styles.label}>Customer</Text>
                    <TextInput
                        placeholder="eg. Black & McDonald"
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                        editable={true}
                        value={customer}
                        onChangeText={setCustomer}
                    />

                    {/* Site Address */}
                    <Text style={styles.label}>Site Address</Text>
                    <TextInput
                        placeholder="eg. 500 Comissioner St."
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                        editable={true}
                        value={siteAddress}
                        onChangeText={setSiteAddress}
                    />

                    {/* Location  */}
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Location</Text>
                            <View style={{position: 'relative'}}>
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


                    {/* Site Contact */}
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Site Contact</Text>
                            <TextInput
                                placeholder="eg. Maria Labeeba"
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
                        onChangeText={setWorkPerformed}
                    />

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


                    <View style={{marginTop: 10, alignItems: 'flex-end', paddingRight: 16}}>
                        <Text style={{fontSize: 12, fontWeight: 'bold'}}>
                            Net Cost: ${calculateTotalCost()}
                        </Text>
                        <Text style={{fontSize: 12, fontWeight: 'bold'}}>
                            HST/GST: ${(parseFloat(calculateTotalCost()) * 0.13).toFixed(2)}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 5}}>
                            Total Cost: ${(parseFloat(calculateTotalCost()) * 1.13).toFixed(2)}
                        </Text>
                    </View>

                    <Text style={styles.section}>Job Status</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12}}>
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
                                        shadowOffset: {width: 0, height: 1},
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

                    <Text style={styles.section}>Orientation</Text>
                    <View style={{flexDirection: 'row', gap: 10}}>
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
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: isSelected ? '#00aa77' : '#333'
                                    }}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.section}>Hot Work Permit</Text>
                    <View style={{flexDirection: 'row', gap: 10}}>
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
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: isSelected ? '#00aa77' : '#333'
                                    }}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );

                        })}
                    </View>


                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditWorkOrderForm;



