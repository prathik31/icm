package com.telecom.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;
        String userId = null;
        String role = null;

        if (StringUtils.hasText(requestTokenHeader)) {
            String header = requestTokenHeader.trim();
            if (header.regionMatches(true, 0, "Bearer ", 0, 7)) {
                jwtToken = header.substring(7).trim();
                try {
                    username = jwtUtil.extractUsername(jwtToken);
                    userId = jwtUtil.extractUserId(jwtToken);
                    role = jwtUtil.extractRole(jwtToken);
                } catch (Exception e) {
                    logger.warn("Unable to get JWT Token or JWT Token has expired", e);
                }
            } else {
                logger.warn("Authorization header provided but does not begin with Bearer String");
            }
        }

        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwtToken, username)) {
                String normalizedAuthority = role != null && role.startsWith("ROLE_") ? role : "ROLE_" + role;
                // Create authentication object
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userId, // principal
                                null, // credentials
                                List.of(new SimpleGrantedAuthority(normalizedAuthority)) // authorities
                        );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication in the context
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}