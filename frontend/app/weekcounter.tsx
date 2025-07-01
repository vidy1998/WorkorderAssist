import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import styles from '../styles/AddWorkOrdersform.styles';

function getCustomCalendarWeekNumber(): number {
    const anchorDate = new Date('2023-01-09'); // Monday before Jan 11, 2023
    const today = new Date();
    anchorDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const msInDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.floor((today.getTime() - anchorDate.getTime()) / msInDay);
    return Math.floor(diffInDays / 7) + 1;
}

const WeekCounter: React.FC = () => {
    const [week, setWeek] = useState('');

    useEffect(() => {
        setWeek(`${getCustomCalendarWeekNumber() -1 }`);
    }, []);

    return (
        <TextInput value={week} editable={true} style={styles.input} />
    );
};

export default WeekCounter;
