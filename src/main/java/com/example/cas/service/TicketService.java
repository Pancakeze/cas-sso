package com.example.cas.service;

import com.example.cas.model.ServiceTicket;
import com.example.cas.model.TicketGrantingTicket;
import com.example.cas.util.TicketGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TicketService {
    
    private final Map<String, TicketGrantingTicket> tgtStore = new ConcurrentHashMap<>();
    private final Map<String, ServiceTicket> stStore = new ConcurrentHashMap<>();
    
    @Value("${cas.ticket.service.lifetime:300}")
    private long serviceTicketLifetime;
    
    @Value("${cas.ticket.granting.lifetime:86400}")
    private long grantingTicketLifetime;
    
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    
    public TicketService() {
        // 定期清理过期票据
        scheduler.scheduleAtFixedRate(this::cleanupExpiredTickets, 1, 1, TimeUnit.MINUTES);
    }
    
    private void cleanupExpiredTickets() {
        long now = System.currentTimeMillis() / 1000;
        tgtStore.entrySet().removeIf(entry -> entry.getValue().getExpiresAt() <= now);
        stStore.entrySet().removeIf(entry -> entry.getValue().getExpiresAt() <= now);
    }
    
    public TicketGrantingTicket createTGT(String username) {
        String tgtId = TicketGenerator.generateTGT();
        TicketGrantingTicket tgt = TicketGrantingTicket.create(tgtId, username, grantingTicketLifetime);
        saveTGT(tgt);
        return tgt;
    }
    
    public void saveTGT(TicketGrantingTicket tgt) {
        tgtStore.put(tgt.getId(), tgt);
    }
    
    public Optional<TicketGrantingTicket> getTGT(String tgtId) {
        TicketGrantingTicket tgt = tgtStore.get(tgtId);
        if (tgt == null) return Optional.empty();
        if (tgt.isExpired()) {
            tgtStore.remove(tgtId);
            return Optional.empty();
        }
        return Optional.of(tgt);
    }
    
    public void deleteTGT(String tgtId) {
        tgtStore.remove(tgtId);
    }
    
    public ServiceTicket createST(String service, TicketGrantingTicket tgt) {
        String stId = TicketGenerator.generateST(service);
        ServiceTicket st = ServiceTicket.create(stId, service, tgt.getUsername(), serviceTicketLifetime);
        saveST(st);
        return st;
    }
    
    public void saveST(ServiceTicket st) {
        stStore.put(st.getId(), st);
    }
    
    public Optional<ServiceTicket> consumeST(String stId) {
        ServiceTicket st = stStore.remove(stId);
        if (st == null) return Optional.empty();
        if (st.isExpired()) {
            return Optional.empty();
        }
        return Optional.of(st);
    }
}
