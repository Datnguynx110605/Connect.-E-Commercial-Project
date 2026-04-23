using Connect.API;
using Connect.Application;
using Connect.Infrastructure;
using Hangfire;
using Microsoft.AspNetCore.Identity.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information() 
    .Enrich.FromLogContext()           
    .WriteTo.Seq("http://localhost:5341") 
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services
    .AddPresentation(builder.Configuration)
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseCustomMiddleware();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Connect. API v1");
        options.RoutePrefix = string.Empty; 
    });

    var seqUrl = "http://localhost:5341";
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = seqUrl,
            UseShellExecute = true
        });
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.UseHangfireDashboard();

app.MapControllers();

app.Run();
