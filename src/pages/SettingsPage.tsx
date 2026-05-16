import React, { JSX } from "react";

function SettingsPage(): JSX.Element {
  return (
    <>
      <h1>Paramètres</h1>
      <div style={{ background: "#0000007F", borderRadius: 10, margin: 8, padding: 16 }}>
        <p>Ce lecteur utilise l'API publique Odysee et ne nécessite aucun daemon local.</p>
        <p>Contenu filtré par langue française par défaut.</p>
      </div>
    </>
  );
}

export default SettingsPage;
