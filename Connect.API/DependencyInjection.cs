using Microsoft.OpenApi;

namespace Connect.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPresentation(this IServiceCollection services)
        {
            services.AddControllers();
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Connect. API",
                    Version = "v1",
                    Description = "Connect. API platform"
                });
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Enter your JWT token: Bearer {token}",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });

                options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
                {
                   {
                     new OpenApiSecuritySchemeReference("Bearer"),
                     new List<string>()
                   }
                });
            });

            return services;
        }
    }
}
