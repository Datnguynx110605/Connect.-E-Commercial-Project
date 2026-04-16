using Connect.API;
using Connect.Application;
using Connect.Infrastructure;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPresentation(builder.Configuration)
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseCustomMiddleware();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Connect. API v1");
        options.RoutePrefix = string.Empty; 
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard();

app.MapControllers();

app.Run();
