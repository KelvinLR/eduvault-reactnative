import forge from 'node-forge';

const CryptoManager = {
  fetchPublicKey: async (api) => {
    // Busca a chave pública da API
    const response = await api.get('/api/crypto/public-key');
    const base64String = response.data.publicKey;
    
    // Decodifica a string base64 para obter os bytes DER
    const derBytes = forge.util.decode64(base64String);
    
    // Converte os bytes DER para um objeto ASN.1
    const asn1 = forge.asn1.fromDer(derBytes);
    
    // Extrai e retorna o objeto da chave pública RSA do node-forge
    return forge.pki.publicKeyFromAsn1(asn1);
  },

  encryptData: (plaintext, rsaPublicKey) => {
    // 1. Gera 32 bytes aleatórios para a chave AES (AES-256)
    const aesKeyBytes = forge.random.getBytesSync(32);
    
    // 2. Gera 12 bytes aleatórios para o IV (Initialization Vector)
    const ivBytes = forge.random.getBytesSync(12);
    
    // 3. Cria o cipher AES-GCM usando a chave AES gerada
    const cipher = forge.cipher.createCipher('AES-GCM', aesKeyBytes);
    
    // 4. Inicia o cipher com o IV e tamanho da tag (128 bits)
    cipher.start({ iv: ivBytes, tagLength: 128 });
    
    // 5. Adiciona os dados em plaintext (convertendo a string UTF-8 para buffer)
    cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
    
    // 6. Finaliza a criptografia
    cipher.finish();
    
    // 7. Obtém o ciphertext concatenando os bytes criptografados com a tag GCM
    // IMPORTANTE: Java's AES/GCM/NoPadding anexa a tag GCM ao ciphertext,
    // então precisamos fazer o mesmo aqui para manter a compatibilidade
    const ciphertextWithTag = cipher.output.getBytes() + cipher.mode.tag.getBytes();
    
    // 8. Criptografa a chave AES usando a chave pública RSA com OAEP
    // NOTA: Java's RSA/ECB/OAEPPadding usa SHA-1 por padrão para o hash OAEP e hash MGF1
    const encryptedAesKeyBytes = rsaPublicKey.encrypt(aesKeyBytes, 'RSA-OAEP', {
      md: forge.md.sha1.create(),
      mgf1: { md: forge.md.sha1.create() }
    });
    
    // 9. Retorna o objeto contendo ciphertext, IV e chave AES criptografada (todos codificados em Base64)
    return {
      ciphertext: forge.util.encode64(ciphertextWithTag),
      iv: forge.util.encode64(ivBytes),
      encryptedAesKey: forge.util.encode64(encryptedAesKeyBytes)
    };
  }
};

export default CryptoManager;
