const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo'
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done())
})

describe('POST /todos', () => {
    it('Should create a new Todo', (done) => {
        var text = 'Test todo Text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    // expect(todo).toInclude({
                    //     text:'Test todo Text'
                    // })
                    done();
                }).catch((e) => {
                    return done(e);
                })
            })
    });

    it('Should not create todo with invalid body data', (done) => {
        var tobj = {
            text: ''
        }
        request(app)
            .post('/todos')
            .send(tobj)
            .expect(400)
            .end((err, res) => {
                if (err) { return done(err); }
            })

        Todo.find().then((todo) => {
            expect(todo.length).toBe(2)
            done();
        }).catch((e) => done(e))
    })

})

describe('GET /todos', () => {
    it('Should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                //console.log(res.body)
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
});

describe('GET /todos/:id', () => {
    it('Should get the doc with spicified ID', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.doc.text).toBe(todos[0].text)
            })
            .end(done)
    })

    it('Should return 404 if doc not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
            .expect((res) => {
                expect(res.body.completed).toBe('no')
            })
    })

    it('Should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    })
})

