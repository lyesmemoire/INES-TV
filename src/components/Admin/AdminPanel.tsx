import React, { useState } from "react";

export default function AdminPanel() {
  const [code, setCode] = useState("");

  const generate = async () => {
    const res = await fetch("/api/admin/code/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: "SECRET_ADMIN_KEY",
        days: 30,
      }),
    });

    const data = await res.json();
    setCode(data.code);
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={generate}>Generate Code</button>
      <p>{code}</p>
    </div>
  );
}
