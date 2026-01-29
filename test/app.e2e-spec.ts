import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import * as pactum from 'pactum';
import { BookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client/extension';


describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;


  beforeAll(async () => {

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();


    app = moduleRef.createNestApplication();


    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,        
        forbidNonWhitelisted: true,
        transform: true,            
      }),
    );




    await app.init();
    await app.listen(3333);


    prisma = app.get(PrismaService);
    await prisma.cleanDb();


    pactum.request.setBaseUrl('http://localhost:3333');

  });


  afterAll(async () => {
    await app.close();
  });



  

  describe("Auth", () => {
    const dto: AuthDto = {
      email: "test.mail@gmail.com",
      password: 'zfeoiejfoeke5',
      name: "test_user0"
    }

    describe("Sign Up", () => {
      it("should throw an error if email is empty", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .withBody({
            password: dto.password,
            name: dto.name
          })
          .expectStatus(400);
      });

      it("should throw an error if password is empty", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .withBody({
            email:dto.email,
            name: dto.name
          })
          .expectStatus(400);
      })

      it("should throw an error if password is too short", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .withBody({
            email: dto.email,
            password: "123",
            name: dto.name
          })
          .expectStatus(400);
      });


      it("should throw an error if name is empty", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .withBody({
            email: dto.email,
            password: dto.password
          })
          .expectStatus(400);
      });

      it("should throw an error if there's no body provided", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .expectStatus(400)
      });


      it("should sign up a user", () => {
        return pactum
          .spec()
          .post("/authentication/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe("Log In", () => {
      it("should throw an error if email is empty", () => {
        return pactum
          .spec()
          .post("/authentication/login")
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });

      it("should throw an error if password is empty", () =>{
        return pactum
          .spec()
          .post("/authentication/login")
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });

      it("should throw an error if there's no body", () => {
        return pactum
          .spec()
          .post("/authentication/login")
          .expectStatus(400)
      });

      it("should log in the user", () => {
        return pactum
          .spec()
          .post("/authentication/login")
          .withBody({
            email: dto.email,
            password: dto.password
          })
          .expectStatus(200)
          .stores("userToken", "access_token")
      });

    });
  });


  describe("User", () => {

    describe("Get user", () => {
      it("should return the user", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .expectStatus(200);
      });
    });


    describe("Edit user by id", () => {
      it("should edit user", () => {
        return pactum 
          .spec()
          .patch("/users/edit_profile")
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .withBody({
            email: 'newmail@gmail.com',
            name: 'newace'
          })
          .expectStatus(200)
          .inspect();
      });
    });

    
  });


  describe("Bookmark", () => {
    const dto: BookmarkDto = {
      title: "Bookmark title here",
      url: "https://bookmarks.org/UtrHzk%efie",
      description: "Some description test goes here for test purposes"
    }
    
    
    //Create a second test user
    let otherUserToken: string;
    
    beforeAll(async () => {
      otherUserToken = await pactum
        .spec()
        .post('/authentication/signup')
        .withBody({
          email: 'other@test.com',
          password: '123456789',
          name: 'Other User'
        })
        .expectStatus(201)
        .returns('access_token');
    });




    describe("create bookmark", () => {
      it("should create a new bookmark for a user", () => {
        return pactum
          .spec()
          .post("/bookmark/create-new-bookmark")
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores("bid", "id");

      })
    });

    describe("get all bookmarks", () => {
      it('should return all bookmarks', () => {
        return pactum
        .spec()
        .get("/bookmark/all")
        .withHeaders({
          Authorization: "Bearer $S{userToken}"
        })
        .expectStatus(200)
      });
    });

    describe("get bookmark by id", () => {
      it("should return the bookmark with the specified id", () => {
        return pactum
          .spec()
          .get("/bookmark/{id}")
          .withPathParams('id', '$S{bid}')
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .expectStatus(200)
          .inspect()
      });
    });

    describe("edit bookmark by id", () => {
      const newDto = {
        title: "New bookmark title",
        url: "https://bookmark.org/v2/YtehzjAkpd8d",
        description: "This is an edited description for test purposes"
      }

      it("should return the edited bookmark with the specified id", () => {
        return pactum
          .spec()
          .patch("/bookmark/edit/{id}")
          .withPathParams('id', '$S{bid}')
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .withBody(newDto)
          .expectStatus(200)
      });

      it("should reject the edition since it's unauthorized in this case", () => {
        return pactum
          .spec()
          .patch("/bookmark/edit/{id}")
          .withPathParams('id', '$S{bid}')
          .withHeaders({
            Authorization: `Bearer ${otherUserToken}`
          })
          .withBody(newDto)
          .expectStatus(403)
      });
    });

    describe("delete bookmark by id", () => {
      it("should return the deleted bookmark with the specified id", () => {
        return pactum
          .spec()
          .delete("/bookmark/delete/{id}")
          .withPathParams('id', '$S{bid}')
          .withHeaders({
            Authorization: "Bearer $S{userToken}"
          })
          .expectStatus(204)
      });

      it("should reject the deletion since it's unauthorized in this case", () => {
        console.log("OTHER USER TOKEN", otherUserToken);
        return pactum
          .spec()
          .delete("/bookmark/delete/{id}")
          .withPathParams('id', '$S{bid}')
          .withHeaders({
            Authorization: `Bearer ${otherUserToken}`
          })
          .expectStatus(403);
      });
    });
  });




  it.todo("should pass");
});