using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class APIController : ControllerBase
    {
        protected readonly ISender Sender;

        protected APIController(ISender sender)
        {
            Sender = sender;
        }
    }
}
