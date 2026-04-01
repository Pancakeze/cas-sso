package com.example.cas.model;
import java.io.Serializable;
import java.time.Instant;

public class ServiceTicket implements Serializable {
    private String id;
    private String service;
    private String username;
    private long createdAt;
    private long expiresAt;

    public ServiceTicket() {}

    public static ServiceTicket create(String id, String service, String username, long lifetimeSeconds) {
        long now = Instant.now().getEpochSecond();
        ServiceTicket st = new ServiceTicket();
        st.setId(id);
        st.setService(service);
        st.setUsername(username);
        st.setCreatedAt(now);
        st.setExpiresAt(now + lifetimeSeconds);
        return st;
    }

    public boolean isExpired() {
        return Instant.now().getEpochSecond() > expiresAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
