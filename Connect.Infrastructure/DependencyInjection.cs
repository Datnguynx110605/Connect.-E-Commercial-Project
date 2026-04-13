using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Infrastructure.Data;
using Connect.Infrastructure.Persistences;
using Connect.Infrastructure.Services;
using Connect.Infrastructure.Settings;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

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
            services.AddScoped<IJWTService, JWTService>();

            services.AddScoped<IPasswordService, PasswordService>();

            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
            services.AddScoped<IEmailService, EmailService>();

            services.AddHangfire(config => config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180).UseSimpleAssemblyNameTypeSerializer().UseRecommendedSerializerSettings().UseSqlServerStorage(configuration.GetConnectionString("DefaultConnection")));
            services.AddHangfireServer();

            return services;
        }
    }
}
