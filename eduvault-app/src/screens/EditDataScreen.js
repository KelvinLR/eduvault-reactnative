import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import CryptoManager from '../crypto/CryptoManager';
import colors from '../theme/colors';

export default function EditDataScreen({ navigation }) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState('');

  const handleSave = async () => {
    if (!name || !cpf || !birthDate || !phone) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const data = { name, cpf, birthDate, phone };
      const jsonString = JSON.stringify(data);

      setEncryptionStep('Buscando chave pública RSA...');
      const publicKey = await CryptoManager.fetchPublicKey(api);

      setEncryptionStep('Gerando chave AES-256...\nCriptografando dados com AES-GCM...\nProtegendo chave AES com RSA-OAEP...');
      // Simulated delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      const encryptedPayload = CryptoManager.encryptData(jsonString, publicKey);

      setEncryptionStep('Enviando envelope criptografado...');
      await api.put('/students/me', encryptedPayload);

      setEncryptionStep('');
      Alert.alert('Sucesso', 'Dados criptografados e salvos com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar os dados.');
      setEncryptionStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Dados</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor={colors.textSecondary}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Data de Nascimento (DD/MM/AAAA)"
              placeholderTextColor={colors.textSecondary}
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {encryptionStep ? (
              <View style={styles.encryptionFeedback}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stepText}>{encryptionStep}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={styles.successButton} 
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Processando...' : '🔐 Salvar com Criptografia'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    fontSize: 16,
  },
  successButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  encryptionFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
