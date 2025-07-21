import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const TrendsScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0e141b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mood Trends</Text>
        </View>

        {/* Overall Mood Section */}
        <Text style={styles.sectionTitle}>Overall Mood</Text>
        <View style={styles.cardContainer}>
          <View style={styles.moodCard}>
            <Text style={styles.cardLabel}>Average Mood</Text>
            <Text style={styles.cardValue}>Neutral</Text>
          </View>
        </View>

        {/* Mood Over Time Section */}
        <Text style={styles.sectionTitle}>Mood Over Time</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartCard}>
            <Text style={styles.chartLabel}>Mood Score</Text>
            <Text style={styles.chartValue}>Neutral</Text>
            <View style={styles.chartInfo}>
              <Text style={styles.chartPeriod}>Last 7 Days</Text>
              <Text style={styles.chartChange}>+10%</Text>
            </View>
            
            {/* Chart Area */}
            <View style={styles.chartArea}>
              <Svg width="100%" height="148" viewBox="-3 0 478 150" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#e7edf3" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#e7edf3" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                
                {/* Filled area */}
                <Path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                  fill="url(#gradient)"
                />
                
                {/* Line */}
                <Path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#4e7097"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              
              {/* Day labels */}
              <View style={styles.dayLabels}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Text key={day} style={styles.dayLabel}>{day}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Emotional Patterns Section */}
        <Text style={styles.sectionTitle}>Emotional Patterns</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartCard}>
            <Text style={styles.chartLabel}>Emotion Frequency</Text>
            <Text style={styles.chartValue}>12</Text>
            <View style={styles.chartInfo}>
              <Text style={styles.chartPeriod}>Last 30 Days</Text>
              <Text style={styles.chartChange}>+5%</Text>
            </View>
            
            {/* Bar Chart */}
            <View style={styles.barChart}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: '30%' }]} />
                <Text style={styles.barLabel}>Happy</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: '30%' }]} />
                <Text style={styles.barLabel}>Sad</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: '40%' }]} />
                <Text style={styles.barLabel}>Angry</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: '80%' }]} />
                <Text style={styles.barLabel}>Anxious</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personalized Insights Section */}
        <Text style={styles.sectionTitle}>Personalized Insights</Text>
        <View style={styles.insightContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>
                You've been feeling more positive lately. Keep up the great work!
              </Text>
              <Text style={styles.insightSubtitle}>
                Your mood has improved by 10% in the last week.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  } as ViewStyle,

  scrollContainer: {
    paddingBottom: 20,
  } as ViewStyle,

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  } as ViewStyle,

  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0e141b',
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  } as TextStyle,

  // Section Styles
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0e141b',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  } as TextStyle,

  // Card Styles
  cardContainer: {
    paddingHorizontal: 16,
  } as ViewStyle,

  moodCard: {
    backgroundColor: '#e7edf3',
    borderRadius: 12,
    padding: 24,
    minWidth: 158,
  } as ViewStyle,

  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0e141b',
    marginBottom: 8,
  } as TextStyle,

  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0e141b',
  } as TextStyle,

  // Chart Styles
  chartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  } as ViewStyle,

  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  chartLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0e141b',
    marginBottom: 8,
  } as TextStyle,

  chartValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0e141b',
    marginBottom: 8,
  } as TextStyle,

  chartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  } as ViewStyle,

  chartPeriod: {
    fontSize: 16,
    color: '#4e7097',
  } as TextStyle,

  chartChange: {
    fontSize: 16,
    fontWeight: '500',
    color: '#07883b',
  } as TextStyle,

  // Chart Area
  chartArea: {
    minHeight: 180,
    gap: 32,
  } as ViewStyle,

  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  } as ViewStyle,

  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4e7097',
  } as TextStyle,

  // Bar Chart Styles
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingHorizontal: 12,
  } as ViewStyle,

  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    gap: 8,
  } as ViewStyle,

  bar: {
    backgroundColor: '#e7edf3',
    borderTopWidth: 2,
    borderTopColor: '#4e7097',
    width: '80%',
    minHeight: 20,
  } as ViewStyle,

  barLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4e7097',
  } as TextStyle,

  // Insight Styles
  insightContainer: {
    paddingHorizontal: 16,
  } as ViewStyle,

  insightCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    minHeight: 132,
    justifyContent: 'flex-end',
    backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%)',
  } as ViewStyle,

  insightContent: {
    gap: 8,
  } as ViewStyle,

  insightTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 28,
  } as TextStyle,

  insightSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  } as TextStyle,
});

export default TrendsScreen;
