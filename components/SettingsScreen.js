import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';

const SettingsScreen = ({ darkMode, setDarkMode, onBack }) => {
  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#2C3E50" : "#FFFFFF"} />
      
      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, darkMode && styles.backButtonTextDark]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>⚙️ Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Settings */}
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            🎨 Appearance
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, darkMode && styles.settingLabelDark]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#3498DB' }}
              thumbColor={darkMode ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, darkMode && styles.settingLabelDark]}>
                Current Theme
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                {darkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            ℹ️ About
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, darkMode && styles.settingLabelDark]}>
                App Version
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                ToDo App v1.0.0
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, darkMode && styles.settingLabelDark]}>
                Developer
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                Built with ❤️ using React Native & Expo
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Preview */}
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            🎨 Theme Preview
          </Text>
          
          <View style={[styles.previewContainer, darkMode && styles.previewContainerDark]}>
            <Text style={[styles.previewTitle, darkMode && styles.previewTitleDark]}>
              Sample Task
            </Text>
            <Text style={[styles.previewDescription, darkMode && styles.previewDescriptionDark]}>
              This is how your tasks will look with the current theme
            </Text>
            <View style={styles.previewButton}>
              <Text style={styles.previewButtonText}>✓ Complete</Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <TouchableOpacity 
            style={[styles.backToMainButton, darkMode && styles.backToMainButtonDark]}
            onPress={onBack}
          >
            <Text style={styles.backToMainButtonText}>🏠 Back to Tasks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  containerDark: {
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerDark: {
    backgroundColor: '#2C3E50',
    borderBottomColor: '#34495E',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
  backButtonTextDark: {
    color: '#5DADE2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#2C3E50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingLabelDark: {
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  settingDescriptionDark: {
    color: '#BDC3C7',
  },
  previewContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  previewContainerDark: {
    backgroundColor: '#34495E',
    borderLeftColor: '#5DADE2',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  previewTitleDark: {
    color: '#FFFFFF',
  },
  previewDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  previewDescriptionDark: {
    color: '#BDC3C7',
  },
  previewButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  backToMainButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backToMainButtonDark: {
    backgroundColor: '#2980B9',
  },
  backToMainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
