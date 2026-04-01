package com.example.cas.model;
import java.io.Serializable;
import java.time.Instant;

public class TicketGrantingTicket implements Serializable {
    private String id;
    private String username;
    private long createdAt;
    private long expiresAt;

    public TicketGrantingTicket() {}

    public static TicketGrantingTicket create(String id, String username, long lifetimeSeconds) {
        long now = Instant.now().getEpochSecond();
        TicketGrantingTicket tgt = new TicketGrantingTicket();
        tgt.setId(id);
        tgt.setUsername(username);
        tgt.setCreatedAt(now);
        tgt.setExpiresAt(now + lifetimeSeconds);
        return tgt;
    }

    public boolean isExpired() {
        return Instant.now().getEpochSecond() > expiresAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
