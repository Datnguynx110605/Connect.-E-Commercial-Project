using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Infrastructure.Data.MyDbContext;
using Connect.Infrastructure.Persistences;
using Connect.Infrastructure.Services;
using Connect.Infrastructure.Settings;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OAuth2.Client;
using OAuth2.Client.Impl;
using OAuth2.Configuration;
using OAuth2.Infrastructure;
using System;
using System.Collections.Generic;
using System.Text;
using VNPAY;
using VNPAY.Extensions;

namespace Connect.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddDatabase(configuration)
                .AddUnitOfWork()
                .AddServices(configuration);

            return services;
        }

        private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ConnectDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("Default")));
            return services;
        }

        private static IServiceCollection AddUnitOfWork(this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            return services;
        }

        private static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDataProtection();

            services.Configure<JWTSetting>(configuration.GetSection("Jwt"));

            services.AddScoped<IJWTService, JWTService>();

            services.AddScoped<IPasswordService, PasswordService>();

            var vnpaySection = configuration.GetSection("VNPAY");
            services.AddVnpayClient(config =>
            {
                config.TmnCode = vnpaySection["TmnCode"]!;
                config.HashSecret = vnpaySection["HashSecret"]!;
                config.CallbackUrl = vnpaySection["CallbackUrl"]!;
                config.BaseUrl   = vnpaySection["BaseUrl"]!;
                config.Version   = vnpaySection["Version"]!;
                config.OrderType = vnpaySection["OrderType"]!;
            });

            services.AddScoped<IPaymentGateway, PaymentGateway>();

            services.AddHttpContextAccessor();

            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.AddScoped<IEmailVerificationService, EmailVerificationService>();

            services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
            services.AddScoped<IEmailService, EmailService>();

            services.AddHangfire(config => config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180).UseSimpleAssemblyNameTypeSerializer().UseRecommendedSerializerSettings().UseSqlServerStorage(configuration.GetConnectionString("Default")));
            services.AddHangfireServer();

            services.AddSignalR().AddStackExchangeRedis("localhost:6379");
            services.AddScoped<INotificationService, NotificationService>();

            var googleauthSection = configuration.GetSection("GoogleOAuth2");
            services.AddSingleton<IRequestFactory, RequestFactory>();

            services.AddSingleton<IClientConfiguration>(new ClientConfiguration
            {
                ClientId = googleauthSection["ClientId"]!,
                ClientSecret = googleauthSection["ClientSecret"]!,
                RedirectUri = googleauthSection["RedirectUri"]!,   
                Scope = googleauthSection["Scope"],
                ClientTypeName = "Google",
                IsEnabled = true
            });

            services.AddSingleton<IClient, GoogleClient>();
            services.AddScoped<IOAuthService, OAuthService>();

            return services;
        }
    }
}
