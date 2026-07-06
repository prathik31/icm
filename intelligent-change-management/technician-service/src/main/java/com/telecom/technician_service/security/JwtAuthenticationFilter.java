package com.telecom.technician_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtProperties jwtProperties;

    public JwtAuthenticationFilter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = parseToken(request);
        if (StringUtils.hasText(token)) {
            try {
                Jws<Claims> claimsJws = Jwts.parserBuilder()
                        .setSigningKey(jwtProperties.getSecret().getBytes())
                        .build()
                        .parseClaimsJws(token);

                Claims claims = claimsJws.getBody();
                String userId = claims.get("userId", String.class);
                String role = claims.get("role", String.class);

                System.out.println("===== JWT DEBUG =====");
                System.out.println("USER ID = " + userId);
                System.out.println("ROLE = " + role);
                System.out.println("URI = " + request.getRequestURI());
                System.out.println("METHOD = " + request.getMethod());
                System.out.println("=====================");

                if (userId != null && role != null) {
                    String normalizedAuthority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(normalizedAuthority));
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userId, token, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authenticated userId={} role={} grantedAuthorities={}", userId, role, authorities);
                } else {
                    logger.debug("JWT missing required userId or role claim. userId={}, role={}", userId, role);
                }
            } catch (JwtException | IllegalArgumentException ex) {
                logger.debug("Invalid JWT token: {}", ex.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }

    private String parseToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header)) {
            String trimmed = header.trim();
            if (trimmed.regionMatches(true, 0, "Bearer ", 0, 7)) {
                return trimmed.substring(7).trim();
            }
        }
        return null;
    }
}
