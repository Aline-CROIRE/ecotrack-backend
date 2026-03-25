import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { X, AlertTriangle, FileText } from 'lucide-react-native';
import apiClient from '../api/client';

const NewReportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    setLoading(true);
    try {
      await apiClient.post('/reports', form);
      
      // Stop loading
      setLoading(false);

      // Explicitly navigate to 'Main' after success instead of goBack()
      Alert.alert(
        'Report Submitted', 
        'Thank you for helping us keep the city clean!', 
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit report. Please try again later.');
    }
  };

  // Safe Close function
  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <Container>
      <Header>
        <CloseButton onPress={handleClose}>
          <X color="#0f172a" size={24} />
        </CloseButton>
        <HeaderText>Submit a Report</HeaderText>
        <View style={{ width: 24 }} />
      </Header>

      <ScrollView contentContainerStyle={{ padding: 25 }} showsVerticalScrollIndicator={false}>
        <IconCircle>
          <AlertTriangle color="#15803d" size={40} />
        </IconCircle>
        
        <Instructions>
          Describe the issue clearly (e.g., "Illegal dumping at Main St") so our team can act fast.
        </Instructions>

        <InputLabel>Issue Title</InputLabel>
        <InputWrapper>
          <FileText color="#94a3b8" size={20} />
          <StyledInput 
            placeholder="What happened?" 
            placeholderTextColor="#94a3b8"
            value={form.title}
            onChangeText={(text) => setForm({...form, title: text})}
          />
        </InputWrapper>

        <InputLabel>Detailed Description</InputLabel>
        <TextArea 
          placeholder="Provide more details here..." 
          placeholderTextColor="#94a3b8"
          multiline 
          numberOfLines={6}
          textAlignVertical="top"
          value={form.description}
          onChangeText={(text) => setForm({...form, description: text})}
        />

        <SubmitButton onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <SubmitText>Send Report</SubmitText>
          )}
        </SubmitButton>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM DARK EMERALD) ---
const Container = styled(SafeAreaView)` 
  flex: 1; 
  background: #ffffff; 
`;

const Header = styled.View` 
  flex-direction: row; 
  justify-content: space-between; 
  align-items: center; 
  padding: 10px 20px 20px; 
  border-bottom-width: 1px; 
  border-bottom-color: #f1f5f9; 
`;

const CloseButton = styled.TouchableOpacity`
  padding: 5px;
`;

const HeaderText = styled.Text` 
  font-size: 18px; 
  font-weight: 800; 
  color: #0f172a; 
`;

const IconCircle = styled.View` 
  width: 80px; 
  height: 80px; 
  border-radius: 40px; 
  background: #f0fdf4; 
  align-self: center; 
  justify-content: center; 
  align-items: center; 
  margin-bottom: 20px; 
`;

const Instructions = styled.Text` 
  text-align: center; 
  color: #64748b; 
  line-height: 20px; 
  margin-bottom: 30px; 
  font-size: 14px; 
`;

const InputLabel = styled.Text` 
  font-size: 13px; 
  font-weight: 800; 
  color: #1e293b; 
  margin-bottom: 8px; 
  text-transform: uppercase; 
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.View` 
  flex-direction: row; 
  align-items: center; 
  background: #f8fafc; 
  border: 1px solid #e2e8f0; 
  padding: 12px 15px; 
  border-radius: 12px; 
  margin-bottom: 25px; 
`;

const StyledInput = styled.TextInput` 
  flex: 1; 
  margin-left: 10px; 
  font-size: 16px; 
  color: #0f172a; 
`;

const TextArea = styled.TextInput` 
  background: #f8fafc; 
  border: 1px solid #e2e8f0; 
  padding: 15px; 
  border-radius: 12px; 
  font-size: 16px; 
  color: #0f172a; 
  min-height: 150px; 
  margin-bottom: 30px; 
`;

const SubmitButton = styled.TouchableOpacity` 
  background: #15803d; 
  padding: 20px; 
  border-radius: 15px; 
  align-items: center; 
  margin-bottom: 40px;
  elevation: 4;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
`;

const SubmitText = styled.Text` 
  color: #fff; 
  font-size: 18px; 
  font-weight: 800; 
`;

export default NewReportScreen;