import {
  IonContent,
  IonIcon,
  IonPage,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
  useIonToast,
  IonModal,
  IonButton,
  IonAlert,
  RefresherEventDetail
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { arrowBack, closeCircle, checkmarkCircle, timeOutline, banOutline, qrCodeOutline, trashOutline } from 'ionicons/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useAppSelector } from '../../hooks/loginHooks';
import httpClient from '../../hooks/CapacitorClient';
import '../../assets/InvitationList.css';

interface Invitation {
  id: string | number;
  idAcceso: string;
  nombreInvitado: string;
  rutInvitado: string;
  correoInvitado: string;
  telefonoInvitado: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  idSala: number | null;
  sala: string | null;
  status: string;
  usageLimit: number;
  usedCount: number;
  qrCode: string | null;
  fechaCreacion: string | null;
  cancelledAt: boolean | null;
}

const InvitationList: React.FC = () => {
  const router = useIonRouter();
  const { user } = useAppSelector((state) => state.login);
  const [loading, setLoading] = useState<boolean>(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [deleteConfirmInvitation, setDeleteConfirmInvitation] = useState<Invitation | null>(null);
  const [toast] = useIonToast();

  const showToast = (message: string, color: 'warning' | 'danger' | 'success' = "success") => {
    toast({
      message,
      duration: 2000,
      swipeGesture: "vertical",
      position: "top",
      color,
      buttons: [{ text: "✖", role: "cancel" }]
    });
  };

  const handleBack = () => {
    router.push('/home', 'back', 'pop');
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const normalizedUser = user?.replace(/\./g, '') || '';
      console.log('[InvitationList] Fetching for user:', normalizedUser);
      
      const response = await httpClient.get(`/invitations?userId=${normalizedUser}`);
      
      console.log('[InvitationList] Response:', response);
      
      const data = response.data?.data;
      if (Array.isArray(data)) {
        setInvitations(data);
      } else if (!response.data?.success) {
        showToast('Error al cargar invitaciones', 'danger');
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('[InvitationList] Error:', error);
      showToast('Error al cargar invitaciones', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchInvitations();
    event.detail.complete();
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    try {
      setLoading(true);
      const normalizedUser = user?.replace(/\./g, '') || '';
      
      const response = await httpClient.post(`/invitations/${invitation.id}/cancel`, {
        cancelledBy: normalizedUser
      });

      if (response.data?.success) {
        showToast('Invitación cancelada exitosamente', 'success');
        fetchInvitations(); // Refresh list
      } else {
        showToast(response.data?.message || 'Error al cancelar', 'danger');
      }
    } catch (error) {
      console.error('[InvitationList] Cancel error:', error);
      showToast('Error al cancelar invitación', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (invitation: Invitation) => {
    setDeleteConfirmInvitation(invitation);
  };

  const handleRemoveConfirm = async () => {
    const invitation = deleteConfirmInvitation;
    setDeleteConfirmInvitation(null);
    if (!invitation) return;
    try {
      setLoading(true);
      const response = await httpClient.delete(`/invitations/${invitation.id}`);

      if (response.data?.success) {
        showToast('Invitación eliminada', 'success');
        fetchInvitations();
      } else {
        showToast(response.data?.message || 'Error al eliminar', 'danger');
      }
    } catch (error) {
      console.error('[InvitationList] Remove error:', error);
      showToast('Error al eliminar invitación', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async (invitation: Invitation) => {
    let inv = invitation;
    if (!invitation.qrCode && invitation.id != null) {
      try {
        const res = await httpClient.get(`/invitations/${String(invitation.id)}`);
        if (res.data?.success && res.data?.data) inv = res.data.data as Invitation;
      } catch (_) { /* use list item as-is */ }
    }
    setSelectedInvitation(inv);
    setShowQRModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'PENDING':
        return 'status-pending';
      case 'EXPIRED':
        return 'status-expired';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'USED':
        return 'status-used';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'PENDING':
        return 'Pendiente';
      case 'EXPIRED':
        return 'Expirada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'USED':
        return 'Usada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return checkmarkCircle;
      case 'PENDING':
        return timeOutline;
      case 'EXPIRED':
        return timeOutline;
      case 'CANCELLED':
        return banOutline;
      case 'USED':
        return checkmarkCircle;
      default:
        return timeOutline;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="invitation-list-content">
        <IonLoading spinner="circles" isOpen={loading} onDidDismiss={() => setLoading(false)} />

        <IonAlert
          isOpen={!!deleteConfirmInvitation}
          onDidDismiss={() => setDeleteConfirmInvitation(null)}
          header="Eliminar invitación"
          message={deleteConfirmInvitation ? `¿Eliminar la invitación de ${deleteConfirmInvitation.nombreInvitado || 'este invitado'}? Esta acción no se puede deshacer.` : ''}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', role: 'destructive', handler: handleRemoveConfirm }
          ]}
        />
        
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="invitation-list-container">
          {/* Header */}
          <div className="invitation-list-header">
            <button className="invitation-back-button" onClick={handleBack}>
              <IonIcon icon={arrowBack} />
              <span>Volver</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="invitation-list-title">Mis Invitaciones</h1>
          <p className="invitation-list-subtitle">Gestiona tus invitaciones de acceso</p>

          {/* List */}
          <div className="invitation-list">
            {invitations.length === 0 ? (
              <div className="invitation-empty">
                <p>No tienes invitaciones creadas</p>
                <IonButton onClick={() => router.push('/visit', 'forward', 'push')}>
                  Crear Invitación
                </IonButton>
              </div>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-card-header">
                    <div className="invitation-name">{invitation.nombreInvitado}</div>
                    <div className={`invitation-status ${getStatusColor(invitation.status)}`}>
                      <IonIcon icon={getStatusIcon(invitation.status)} />
                      <span>{getStatusLabel(invitation.status)}</span>
                    </div>
                  </div>
                  
                  <div className="invitation-card-body">
                    {invitation.rutInvitado && (
                      <div className="invitation-detail">
                        <span className="label">RUT:</span>
                        <span className="value">{invitation.rutInvitado}</span>
                      </div>
                    )}
                    <div className="invitation-detail">
                      <span className="label">Horario válido:</span>
                      <span className="value">
                        {formatDate(invitation.fechaInicio) || '—'} – {formatDate(invitation.fechaFin) || '—'}
                      </span>
                    </div>
                    {invitation.sala && (
                      <div className="invitation-detail">
                        <span className="label">Ubicación:</span>
                        <span className="value">{invitation.sala}</span>
                      </div>
                    )}
                    {invitation.motivo && (
                      <div className="invitation-detail">
                        <span className="label">Motivo:</span>
                        <span className="value">{invitation.motivo}</span>
                      </div>
                    )}
                    <div className="invitation-detail">
                      <span className="label">Usos:</span>
                      <span className="value">
                        {invitation.usedCount ?? '—'} / {invitation.usageLimit ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="invitation-card-actions">
                    {(invitation.status === 'ACTIVE' || invitation.status === 'PENDING') && (
                      <>
                        <button 
                          className="invitation-action-btn qr-btn"
                          onClick={() => handleShowQR(invitation)}
                        >
                          <IonIcon icon={qrCodeOutline} />
                          Ver QR
                        </button>
                        <button 
                          className="invitation-action-btn cancel-btn"
                          onClick={() => handleCancelInvitation(invitation)}
                        >
                          <IonIcon icon={closeCircle} />
                          Cancelar
                        </button>
                      </>
                    )}
                    {(invitation.status === 'EXPIRED' || invitation.status === 'CANCELLED' || invitation.status === 'USED') && (
                      <button 
                        className="invitation-action-btn qr-btn disabled"
                        disabled
                      >
                        <IonIcon icon={qrCodeOutline} />
                        QR No Disponible
                      </button>
                    )}
                    <button 
                      className="invitation-action-btn remove-btn"
                      onClick={() => handleRemoveClick(invitation)}
                      title="Eliminar de la lista"
                    >
                      <IonIcon icon={trashOutline} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* QR Modal */}
        <IonModal isOpen={showQRModal} onDidDismiss={() => setShowQRModal(false)}>
          <div className="qr-modal-content">
            <div className="qr-modal-header">
              <h2>Código QR</h2>
              <button onClick={() => setShowQRModal(false)}>
                <IonIcon icon={closeCircle} />
              </button>
            </div>
            {selectedInvitation && (
              <div className="qr-modal-body">
                <div className="qr-image-container">
                  {selectedInvitation.qrCode ? (
                    <img src={selectedInvitation.qrCode} alt="QR Code" />
                  ) : (() => {
                    const code = String(selectedInvitation.id ?? selectedInvitation.idAcceso ?? '');
                    return code ? (
                      <QRCodeSVG value={code} size={200} level="M" includeMargin />
                    ) : (
                      <p className="qr-unavailable">Código QR no disponible</p>
                    );
                  })()}
                </div>
                <p className="qr-name">{selectedInvitation.nombreInvitado}</p>
                <p className="qr-validity">
                  Válido hasta: {formatDate(selectedInvitation.fechaFin)}
                </p>
              </div>
            )}
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default InvitationList;
