package com.telecom.approval_service.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);

			if (jwtUtil.validateToken(token)) {
				String userId = jwtUtil.extractUserId(token);
				String role = jwtUtil.extractRole(token);
				List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

				UsernamePasswordAuthenticationToken authentication =
					new UsernamePasswordAuthenticationToken(userId, null, authorities);
				SecurityContextHolder.getContext().setAuthentication(authentication);

				request.setAttribute("userId", userId);
				request.setAttribute("role", role);

				log.info("Authenticated username: {}", userId);
				log.info("Authenticated role: {}", role);
				log.info("Granted authorities: {}", authorities);
			}
		}

		filterChain.doFilter(request, response);
	}
}
