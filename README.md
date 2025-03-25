# Technical Stacks

- **Front end**: React, Redux, React Router, Tailwind CSS, Yup, Formik
- **Back end**: Flask Microservices, Node.js, RESTful APIs
- **Database**: MySQL (AWS RDS)
- Authentication & Security: JWT in each service
- Storage & Message: AWS S3, Redis, RabbitMQ
- API Communication: Axios, Nodemailer, Gmail SMTP service

# Architecture

We have 9 microservices in total, gateway service, email service and message service used the Node + Express framework, the rest use Flask.

![image](https://github.com/user-attachments/assets/bd43ae1d-3ef2-4d03-b9f3-44701c327f2c)

# Frontend

Already registered:

![image](https://github.com/user-attachments/assets/ad6373e0-7301-4f3f-861c-202b9adff5b0)

Invalid email format:

![image](https://github.com/user-attachments/assets/d215a4ef-63a4-4094-9317-57183aac8a38)

Register successfully, redirect to login page after 2 seconds:

![image](https://github.com/user-attachments/assets/505321c4-cdaf-4cab-a324-73c7fb65915a)

Using `useEffect()` hook and `useLocation()` to automatically fill out the email and password input:

![image](https://github.com/user-attachments/assets/3830d2ae-a59d-4a7c-935e-da901f62e0a8)

Resolve the user verified status from jwt and check if the user has already verified email, if not:

![image](https://github.com/user-attachments/assets/72379133-fc9b-4b70-a56d-46893a2151f9)

If user choose to verify now,  click the send verification code:

![image](https://github.com/user-attachments/assets/0003915c-491c-4441-b54a-864f8e0f2d13)

![image](https://github.com/user-attachments/assets/08d02aa8-ec98-467c-b661-c178ccb4702d)


Email sent to the user’s address, input the code and then jump to the user home page

![image](https://github.com/user-attachments/assets/0012495f-85f2-4d6a-aabe-1387fda73695)


![image](https://github.com/user-attachments/assets/6c15938c-0893-4d84-bd34-38c73ff66d2a)


Banned User: (Jump to contact user…)

![image](https://github.com/user-attachments/assets/110f5b8d-5805-4f27-a24d-e7bfc39e16f7)


### User Profile

![image](https://github.com/user-attachments/assets/5b66dbaf-a735-474a-a384-0557a73d4870)


- Upload profile image:

![image](https://github.com/user-attachments/assets/b8cd338c-ccb3-49a5-8f5c-0d5d9722d27e)


- View top 3 posts: (most reply counts)

![image](https://github.com/user-attachments/assets/29741d75-f504-4fbb-ab6e-c8e9ec8458ce)


- View history

![image](https://github.com/user-attachments/assets/8dac637c-8da2-4bc9-be37-3338db6771d1)


### Post & Reply

- Home page:

![image](https://github.com/user-attachments/assets/36ed729b-89cc-4dfe-9d7e-a532e798643c)


- Create new post/draft

![image](https://github.com/user-attachments/assets/49878489-f1d6-4a10-ac57-94061665feb5)


- My posts

![image](https://github.com/user-attachments/assets/67e1cca3-a2ea-4ad6-b9e7-ca0925d84e42)


- Detail page

![image](https://github.com/user-attachments/assets/e77d55b8-d5ed-4542-8a50-6d3600baf1e4)


- Archive the post, do not allow replying

![image](https://github.com/user-attachments/assets/57ef1b1b-8618-4048-81a6-bf3edfffc815)


- Edit Post:

![image](https://github.com/user-attachments/assets/a5b40959-435a-43f7-9d21-11b8a97dddaa)


![image](https://github.com/user-attachments/assets/81464ea7-5068-48b6-b122-288647209bd8)


Updated successfully:

![image](https://github.com/user-attachments/assets/e976ac39-634a-41b2-bdeb-8b6e8630d359)


![image](https://github.com/user-attachments/assets/910e338e-b0ee-40fd-b2e5-9fb3248b889a)


### Contact us

![image](https://github.com/user-attachments/assets/5e7fc93b-1804-4d20-972e-a489279cbcf4)


### Admin

- Admin dashboard: more filters

![image](https://github.com/user-attachments/assets/0c77c7db-cfbc-42a8-a36b-4d4decfb7924)


- User Management

![image](https://github.com/user-attachments/assets/da1f5ba9-fb99-4b8d-929f-ee23e7854e6b)


- Message management

![image](https://github.com/user-attachments/assets/bdf96d76-9467-4440-9a65-036050beb46c)

### Super Admin

![image](https://github.com/user-attachments/assets/f46355d0-37ee-4e75-9cf3-476e382f5053)



![image.png](attachment:b829184e-45c9-45cf-a106-e53f842d1351:image.png)

### Super Admin
