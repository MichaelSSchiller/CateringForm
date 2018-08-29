using SRHCafe.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Net.Mail;
using System.Text;

namespace SRHCafe.Controllers
{
    public class EmailController : ApiController
    {
        [Route("api/sendemail")]
        [HttpPost]
        public string SendEmail(Email email)
        {
            //use smtp and mail message to construct email 

            string subject = "Catering Submission";
            string from = "SRH.Catering.Request@partners.org"; //string from = email.email;

            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(from);
            mail.IsBodyHtml = true;
            mail.Subject = subject;

            mail.To.Add(email.ToRecipient);
            //mail.To.Add(email.email);

            StringBuilder body = new StringBuilder();
            //Contact info
            body.Append("<h4>Requester Info: </h4>");
            body.Append("<ul>");
            body.Append("<li>Full Name: " + email.Name + "</li>");
            body.Append("<li>Email Address: " + email.email + "</li>");
            body.Append("<li>Phone: " + email.Phone + "</li>");
            body.Append("</ul>");
            if (email.Name2 != null) {
                body.Append("<h4>Contact Person: </h4>");
                body.Append("<ul>");
                body.Append("<li>Full Name: " + email.Name2 + "</li>");
                body.Append("<li>Email Address: " + email.email2 + "</li>");
                body.Append("<li>Phone: " + email.Phone2 + "</li>");
                body.Append("</ul>");
            }
            //Event Info
            body.Append("<h4>Event Info: </h4>");
            body.Append("<ul>");
            body.Append("<li>Event Title: "+ email.EventTitle + "</li>");
            body.Append("<li>Location: "+email.EventLoc + "</li>");
            body.Append("<li>Event Date: "+email.EventDate + "</li>");
            body.Append("<li>Delivery Time: "+email.DeliveryTime + "</li>");
            body.Append("<li>Clean Up Time: "+email.CleanupTime + "</li>");
            body.Append("</ul>");
            //Payment Info
            body.Append("<h4>Payment Info: </h4>");
            body.Append("<ul>");
            body.Append("<li>Cost Center: " + email.CostCenter + "</li>");
            string credit = "Not paying with Credit Card";
            if (email.CreditCard==1)
            {
                credit = "Paying with Credit Card";
            } 
            body.Append("<li>Credit Card: " + credit + "</li>");
            body.Append("</ul>");
            //Order Info
            body.Append("<h3>Order Info: </h3>");
            body.Append("<ul>");
            for (int i=0; i<email.Items.Count(); i++)
            {
                body.Append("<li>" + email.Items.ElementAt(i).Name + "<ul>");
                if (email.Items.ElementAt(i).SubOptions!= null)
                {
                    //SubOptions[]
                    body.Append("<li>Options: <ul>");
                    for (int j=0; j< email.Items.ElementAt(i).SubOptions.Count(); j++)
                    {
                        body.Append("<li>"+ email.Items.ElementAt(i).SubOptions.ElementAt(j).Name + "</li>");
                    }
                    body.Append("</ul></li>");
                }
                if (email.Items.ElementAt(i).NumberOfPeople != 0)
                {
                    //NumberOfPeople
                    body.Append("<li>Number of People: " + email.Items.ElementAt(i).NumberOfPeople + "</li>");
                }
                if (email.Items.ElementAt(i).NumberOfEntrees !=0)
                {
                    //NumberOfEntrees
                    body.Append("<li>Number of Entrees: " + email.Items.ElementAt(i).NumberOfEntrees + "</li>");
                }
                if (email.Items.ElementAt(i).QTY != 0)
                {
                    //QTY
                    body.Append("<li>Qty: " + email.Items.ElementAt(i).QTY + "</li>");
                }
                //Price
                body.Append("<li>Price: $" + email.Items.ElementAt(i).Price + "</li>");

                body.Append("</ul></li>"); //close name
            }
            body.Append("</ul>");
            body.Append("<h3>Grand Total: $" + email.GrandTotal + "</h3>");
            mail.Body = body.ToString();

            SmtpClient smtp = new SmtpClient();
            smtp.Send(mail);

            
            string ret = "succesful web api post";
            return ret;
        }
    }
}
