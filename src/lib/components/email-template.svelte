<script lang="ts">
	let { username = 'User', code = '123456' } = $props();
</script>

<div
	style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #d4d0c8;"
>
	<table
		role="presentation"
		cellspacing="0"
		cellpadding="0"
		border="0"
		width="100%"
		style="background-color: #d4d0c8;"
	>
		<tbody>
			<tr>
				<td align="center" style="padding: 40px 20px;">
					<table
						role="presentation"
						cellspacing="0"
						cellpadding="0"
						border="0"
						width="100%"
						style="max-width: 600px; background-color: #ffffff; border-radius: 8px;"
					>
						<tbody>
							<tr>
								<td style="padding: 40px 30px;" align="center">
									<table
										role="presentation"
										cellspacing="0"
										cellpadding="0"
										border="0"
										width="100%"
									>
										<tbody>
											<!-- Header -->
											<tr>
												<td style="text-align: center; padding-bottom: 40px;">
													<h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #1a1a1a;">
														Welcome to Wantify
													</h1>
												</td>
											</tr>

											<!-- Greeting -->
											<tr>
												<td style="text-align: left; padding-bottom: 30px;">
													<p
														style="margin: 0 0 16px 0; font-size: 18px; line-height: 1.6; color: #1a1a1a;"
													>
														Hello <strong>{username}</strong>,
													</p>
													<p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
														Thank you for joining Wantify! You're receiving this email to verify
														your account. Use the verification code below to complete your signup
														and get started.
													</p>
												</td>
											</tr>

											<!-- Code Box -->
											<tr>
												<td style="padding-bottom: 30px;">
													<table
														role="presentation"
														cellspacing="0"
														cellpadding="0"
														border="0"
														width="100%"
														style="background-color: #2a2a2a; border-radius: 16px;"
													>
														<tbody>
															<tr>
																<td style="padding: 60px 40px; text-align: center;">
																	<div
																		class="code"
																		style="font-family: 'Courier New', Courier, monospace; font-size: 64px; font-weight: bold; color: #ffffff; letter-spacing: 12px;"
																	>
																		{code}
																	</div>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>

											<!-- Expiration Notice -->
											<tr>
												<td style="text-align: center; padding-bottom: 30px;">
													<p style="margin: 0; font-size: 16px; line-height: 1.6; color: #6a6a6a;">
														This code will expire in <strong>10 minutes</strong>
													</p>
												</td>
											</tr>

											<!-- Instructions -->
											<tr>
												<td style="text-align: center; padding-bottom: 60px;">
													<p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
														If you didn't create a Wantify account, you can safely ignore this
														email.<br />
														Someone may have entered your email address by mistake.
													</p>
												</td>
											</tr>

											<!-- Divider -->
											<tr>
												<td style="padding-bottom: 30px;">
													<div style="height: 1px; background-color: #b0b0b0;"></div>
												</td>
											</tr>

											<!-- Footer -->
											<tr>
												<td style="text-align: center;">
													<p
														style="margin: 0 0 8px 0; color: #8a8a8a; font-size: 14px; font-weight: 600; letter-spacing: 2px;"
													>
														WANTIFY
													</p>
													<p style="margin: 0; color: #8a8a8a; font-size: 12px;">
														Need help? Contact us at support@wantify.com (Please don't this doesn't
														work)
													</p>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.code {
		font-family: 'Courier New', Courier, monospace;
	}
</style>
