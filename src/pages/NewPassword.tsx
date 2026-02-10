import { IonButton, IonContent, IonPage, useIonRouter } from "@ionic/react";
import logo from '../../assets/images/logo.png';
import '../../assets/NewPassword.css';

/**
 * This screen is kept for backwards compatibility (e.g. /modpass route).
 * The app uses RUT + full name only for login; there is no password.
 */
const NewPassword: React.FC = () => {
  const router = useIonRouter();

  const handleBackToLogin = () => {
    router.push('/login', 'root', 'replace');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="newpassword-content">
        <div className="newpassword-container">
          <div className="newpassword-logo-section">
            <img src={logo} alt="Logo" />
          </div>
          <div className="newpassword-header-section">
            <h1>Acceso sin contraseña</h1>
            <p>
              El acceso al sistema se realiza solo con tu <strong>RUT</strong> y tu <strong>nombre completo</strong>.
              No se utiliza contraseña.
            </p>
          </div>
          <div className="newpassword-form-section">
            <IonButton
              expand="block"
              className="newpassword-submit-button"
              onClick={handleBackToLogin}
            >
              Volver al inicio de sesión
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NewPassword;
