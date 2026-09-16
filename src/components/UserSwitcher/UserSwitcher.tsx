"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, UserCheck, ShieldCheck } from "lucide-react";

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleTitle: string;
}

interface UserSwitcherProps {
  currentUser?: UserPersona | null;
  onUserChange?: (user: UserPersona) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  currentUser,
  onUserChange,
}) => {
  const [users, setUsers] = useState<UserPersona[]>([]);
  const [activeUser, setActiveUser] = useState<UserPersona | null>(currentUser || null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          if (!currentUser) {
            // Check cookie
            const match = document.cookie.match(/ajaia_user_id=([^;]+)/);
            const savedId = match ? match[1] : data.users[0].id;
            const found = data.users.find((u: UserPersona) => u.id === savedId) || data.users[0];
            setActiveUser(found);
            document.cookie = `ajaia_user_id=${found.id}; path=/; max-age=31536000`;
          }
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  const selectUser = (user: UserPersona) => {
    setActiveUser(user);
    document.cookie = `ajaia_user_id=${user.id}; path=/; max-age=31536000`;
    setIsOpen(false);
    if (onUserChange) {
      onUserChange(user);
    } else {
      window.location.reload();
    }
  };

  if (!activeUser) return null;

  return (
    <div className="user-persona-container">
      <button
        type="button"
        className="user-persona-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch simulated user persona to test collaboration & permissions"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeUser.avatar}
          alt={activeUser.name}
          className="user-persona-avatar"
        />
        <div style={{ textAlign: "left", lineHeight: 1.2 }}>
          <div className="user-persona-name">{activeUser.name}</div>
          <div className="user-persona-role">{activeUser.roleTitle}</div>
        </div>
        <ChevronDown size={14} style={{ color: "var(--text-muted)", marginLeft: 2 }} />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
            onClick={() => setIsOpen(false)}
          />
          <div className="user-persona-menu">
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                padding: "4px 8px 8px",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShieldCheck size={13} color="var(--accent-primary)" />
              SWITCH USER PERSONA
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-persona-item ${user.id === activeUser.id ? "active" : ""}`}
                onClick={() => selectUser(user)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e293b" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {user.roleTitle}
                  </div>
                </div>
                {user.id === activeUser.id && <UserCheck size={16} color="var(--accent-primary)" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
