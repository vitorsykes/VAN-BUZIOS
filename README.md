# Van Local

Aplicativo de rastreamento de vans em tempo real em Búzios (RJ).

Este projeto foi construído usando React e TypeScript. Embora você tenha solicitado Flutter, este ambiente constrói aplicações web modernas e responsivas que podem ser facilmente convertidas para aplicativos móveis (Android/iOS) usando ferramentas como **Capacitor** ou **Cordova**.

## Como executar o projeto localmente (Web)

1. Certifique-se de ter o Node.js instalado.
2. No diretório do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o navegador no endereço exibido (geralmente `http://localhost:3000` ou `http://localhost:5173`).

## Como transformar em APK (Android)

Recomendamos usar o [Capacitor](https://capacitorjs.com/) para empacotar este projeto web em um aplicativo Android nativo.

1. Instale o Capacitor no projeto:
   ```bash
   npm install @capacitor/core
   npm install -D @capacitor/cli
   npx cap init "Van Local" "com.vanlocal.app" --web-dir dist
   ```
2. Construa a aplicação React para produção:
   ```bash
   npm run build
   ```
3. Instale o pacote Android e adicione a plataforma:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
4. Sincronize os arquivos web com o projeto Android:
   ```bash
   npx cap sync android
   ```
5. Abra o projeto no Android Studio e gere o APK:
   ```bash
   npx cap open android
   ```
   No Android Studio, vá em `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## Funcionalidades Implementadas
- **Tempo Real**: Sincronização via Firebase Firestore.
- **Geolocalização**: Integração com a API de Geolocalização do navegador (GPS real).
- **Mapa**: Leaflet + OpenStreetMap.
- **Perfis**: Motorista (compartilha localização e vagas) e Passageiro (vê vans, distância e tempo estimado).
