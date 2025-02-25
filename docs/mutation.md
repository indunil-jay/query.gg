# UseMutation()

why we can't use useQuery() to update the asynchronouse mutation??

```TS
function useUpdateUser(id, newName) {
  return useQuery({
    queryKey: ['user', id, newName],
    queryFn: () => updateUser({ id, newName }),
  })
}
```

It's an interesting idea, but there are several reasons why this wouldn't work.

For one, the query would run immediately when the component mounted. We'd likely want to wait for a specific event (like the user clicking a submit button) before we ran it. We could work around this with the enabled option, but even worse - queries are meant to run multiple times, often automatically.

Running a query (like getting a list of articles) should be an
idempotent
operation and have no side effects on the server. Meaning, React Query should be able to run a query as often as it wants, without unintended (or any) consequences.

Updates, by definition, are neither idempotent nor free of side effects. Every time we perform an update, data might be written to the database, or a PDF might be generated, or an email might be sent to someone.

All these side effects are not something that we want to trigger automatically or more than once. Instead, we want them to happen imperatively when a specific event occurs.

For this, React Query offers another hook called useMutation.

Now I'll get this out of the way, it probably doesn't work how you'd expect it to (so stick with me here).

Just as useQuery manages the lifecycle of a request rather than directly fetching data, useMutation manages the lifecycle of a mutation rather than directly performing the mutation itself.

Here's how it works.

When you invoke useMutation, you give it an object with a mutationFn method. What it gives you is an object with a mutate method.

```TS
const { mutate } = useMutation({ mutationFn })
```

When you invoke mutate, React Query will take the argument you pass to it, and invoke the mutationFn with it.

So if we adapt our updateUser example from earlier to include React Query, here's how it would look.

First, we encapsulate useMutation inside of a custom hook – passing it updateUser as its mutationFn.

```TS
function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
  })
}
```

Then, inside of the component, we invoke mutate whenever the mutation event occurs. In this case, it'll be when a form is submitted.

The object we pass to it will be passed along to the mutationFn as an argument.

```TS
function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
  })
}

function ChangeName({ id }) {
  const { mutate } = useUpdateUser()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const newName = new FormData(event.currentTarget).get('name')
        mutate({ id, newName })
      }}
    >
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```

---

For TypeScript Users
For types to flow through mutations correctly, it's important to type the mutationFn. This is the same principle as Queries, but it's easy to miss because the mutationFn also takes parameters.

Show More
In our example, even if updateUser is typed correctly:

```Ts
declare function updateUser(user: { id: string; newName: string }): Promise<User>
```

our mutationFn input is not typed unless we make it explicit:

type Payload = { id: string; newName: string }

```TS
function useUpdateUser() {
return useMutation({
mutationFn: (payload: Payload) =>
updateUser(payload)
})
}
```

---

Now I know what you're probably thinking – "it doesn't look like useMutation is doing much of anything. Why not just call updateUser directly?".

Remember, the entire point of useMutation is to manage the lifecycle of the mutation – not to mutate anything itself, even the cache. You won't really see the benefit of it until you look at it from that perspective – and to do that, you have to look at what it returns.

When you invoke useMutation, along with the mutate function, you'll also get back a status property that tells you the current state of the mutation – pending, error, success, or idle (the default state of the mutation before mutate has been called).

So for example, if we wanted to disable the submit button while the mutation was in flight, we could do something like this.

```TS
function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
  })
}

function ChangeName({ id }) {
  const { mutate, status } = useUpdateUser()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const newName = new FormData(event.currentTarget).get('name')
        mutate({ id, newName })
      }}
    >
      <input name="name" />
      <button type="submit" disabled={status === "pending"}>
        { status === "pending" ? '...' : "Update" }
      </button>
    </form>
  )
}
```

And more than just observing the status, we can also hook into different moments in the mutation's lifecycle by adding onSuccess, onError, or onSettled callbacks to both the second argument to mutate, or as properties on the object passed to useMutation.

For example, we probably want to reset the form after the mutation was successful. We can do that by passing an object with an onSuccess callback as the second argument to mutate.

```TS
function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
  })
}

function ChangeName({ id }) {
  const { mutate, status } = useUpdateUser()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const newName = new FormData(event.currentTarget).get('name')
        mutate({ id, newName }, {
          onSuccess: () => event.currentTarget.reset()
        })
      }}
    >
      <input name="name" />
      <button type="submit" disabled={status === "pending"}>
        { status === "pending" ? '...' : "Update" }
      </button>
    </form>
  )
}
```

And inside of useMutation, if we wanted to show an alert when the mutation was successful, we could do something like this.

```TS

function useUpdateUser() {
return useMutation({
       mutationFn: updateUser,
        onSuccess: () => {
                alert("name updated successfully")
                }
        })
}
```

Admittedly, this aspect of useMutation isn't particularly interesting. The interesting bits are when you start looking at how mutations and queries can work together.

For example, what if instead of just showing an alert, you wanted to actually do something useful and update the cache with the new user?

The simplest way is to do it imperatively by invoking queryClient.setQueryData in the onSuccess callback. setQueryData works as you'd expect, you give it a query key as its first argument and the new data as the second.

```TS
function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (newUser) => {
      queryClient.setQueryData(['user', newUser.id], newUser)
    }
  })
}
```

Now, once the mutation has finished and the onSuccess callback runs, the cache will be updated with the new user.

It's important to note that React Query doesn't distinguish where data comes from. Data we write to the cache manually will be treated the same as data put into the cache via any other way – like a refetch or prefetch.

That means it will also be considered fresh for however long staleTime is set to.

```TS
For TypeScript Users
queryClient.setQueryData, just like getQueryData, is typed to unknown per default because React Query cannot know what data should live under which queryKey.

Again, just like with getQueryData, this gets better if you use a key created from queryOptions:

import { queryOptions } from '@tanstack/react-query'

const userOptions = (id: number) => queryOptions({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id)
})

queryClient.setQueryData(
  userOptions(newUser.id).queryKey,
  newUser
)
```

And even if updateUser didn't return a promise that resolved with the updated user, we still have a few options to derive the new user in order to update the cache.

We saw that when React Query invokes onSuccess, the first argument it'll pass to it is whatever the mutationFn returns. That's nice, but in this case, it's the second argument that is more valuable to us.

It'll be the object that was passed to mutate, in our example, { id, newName }.

We can use this, along with the fact that if you pass a function as the second argument to queryClient.setQueryData, it will receive the previous data as an argument, in order to derive the new user to update the cache.

```TS
function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, { id, newName }) => {
      queryClient.setQueryData(
        ['user', id],
        (previousUser) => previousUser
          ? ({ ...previousUser, name: newName })
          : previousUser
      )
    }
  })
}

```

Another thing to note is like most state managers in React, React Query requires updates to happen in an immutable way.

What this means is that when you update the cache, you should always return a new object, even if the object you're updating is the same as the previous one.

<!-- For TypeScript Users
The functional updater has this form.

(previousData: TData | undefined) => TData | undefined
This means you should always expect to get undefined passed since there's no guarantee that the Query already exists in the cache when you're updating it.

In these cases, you can just return undefined back and React Query will bail out of the update. -->

So far this has all been pretty straight forward – trigger a mutation and then update the cache imperatively when the mutation succeeds. But, it's not uncommon to have more than one cache entry you need to update when a mutation occurs.

This can happen pretty easily when we have a list with filters and sorting. Every time we change an input, React Query will create a new cache entry, which means one result might be stored multiple times, in different caches, and even in different positions (e.g. depending on the sorting criteria).

We're triggering the mutation when the form is submitted, but we haven't implemented updating the cache yet because it's not as simple as just calling queryClient.setQueryData with the updated list.

The problem is, because of the sorting, we might have multiple list entries in the cache. In this scenario, which one do we update?

```TS
['todos', 'list', { sort: 'id' }]
['todos', 'list', { sort: 'title' }]
['todos', 'list', { sort: 'done' }]
```

Well, we'd probably want to update all of them. The problem is, even with just three sort options, this gets gross pretty quick.

```TS
function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: (newTodo) => {
      queryClient.setQueryData(
        ['todos', 'list', { sort: 'id' }],
        (previousTodos) => [...previousTodos, newTodo ]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort: 'title' }],
        (previousTodos) => [...previousTodos, newTodo ].sort((a, b) => {
          if (String(a.title).toLowerCase() < String(b.title).toLowerCase()) {
            return -1
          }

          if (String(a.title).toLowerCase() > String(b.title).toLowerCase()) {
            return 1
          }

          return 0
        })
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort: 'done' }],
        (previousTodos) => [...previousTodos, newTodo ]
          .sort((a, b) => a.done ? 1 : -1)
      )
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: () => queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

```

And this is the best case scenario. What would happen if the way we sorted the list in our onSuccess callback was different than the way it was sorted on the backend where the actual mutation happens?

In this scenario, the user would see the list sorted one way until a refetch occurred, then they'd see the list sorted another.

That's not ideal.

In scenarios like this where you have an arbitrary number of cache entries that all need to be updated, instead of updating them all manually, a better approach is just to invalidate all of them.

The reason being, when you invalidate a query, it does two things:

1. It refetches all active queries
2. It marks the remaining queries as stale
   If we look at this from first principles, it makes a lot of sense.

When you invalidate a query, if that query has an observer (meaning it's active and most likely its data is being show to the UI), React Query will instantly refetch it and update the cache. Otherwise, it'll get marked as stale and React Query will refetch it the next time a trigger occurs.

Now the next obvious question, how do you invalidate a query?

Thankfully React Query makes this pretty simple and the best part is you don't have to worry about the specifics of how the cache is structured. All you have to do is invoke queryClient.invalidateQueries, passing it a queryKey.

Now, by returning a promise from onSuccess (which is what queryClient.invalidateQueries returns), React Query can wait for the promise to resolve before it considers the mutation complete – avoiding potential UI flashes where the refetch occurs before the mutation has finished.

Again, the trick is that invalidation performs a refetch for active queries. So instead of taking the response that comes back from the mutation and writing it to the cache manually, we completely ignore it and get the source of truth for the list from the server.

This has a few obvious advantages – we no longer have to re-implement server logic on the client, and our list will be guaranteed to be up to date.

Of course, it has the drawback of having to make another round-trip to the server, but this is in-line with React Query being a data synchronization tool. After server state has changed, it's usually a good idea to verify you have the latest data in the cache.

Another tradeoff is that the non active queries won't get refetched immediately (since they're just marked as stale). Usually this is what you want, but if you weren't worried about overfetching, you could add a refetchType property of all to your query options to force all queries, regardless of their status, to refetch immediately.

```TS
queryClient.invalidateQueries({
  queryKey: ['todos', 'list'],
  refetchType: 'all'
})
```

This would lead to an even more consistent cache after a mutation occurs.

Now there is one critical aspect to making invalidateQueries work that you may have not noticed. It even has a fancy name so we can put it in sparkles – Fuzzy Query Key matching.

When we invoked invalidateQueries, we passed it a query key of ['todos', 'list']. This tells React Query to invalidate all queries that start with ['todos', 'list']. That's why all three of our sort queries were invalidated even though none of them matched ['todos', 'list'] exactly.

```TS
['todos', 'list', { sort: 'id' }]
['todos', 'list', { sort: 'title' }]
['todos', 'list', { sort: 'done' }]
```

Notice that this worked because we structured our queryKey hierarchically. In fact, queryKeys are arrays in the first place because arrays have strict hierarchy built in.

Practically speaking, what this means is that you want to order your query keys from generic to specific.

Again if we look at our example, todos is the most generic thing - it refers to our "entity". Then, we have a hardcoded string list, which we've added to distinguish between different kinds of "todo" caches. Finally at the end, we can see the specific "sort".

Now let's say we extended our example by adding a detail view to the UI. If we did that, we'd probably end up with a cache that looked like this.

```TS
['todos', 'list', { sort: 'id' }]
['todos', 'list', { sort: 'title' }]
['todos', 'detail', '1']
['todos', 'detail', '2']
```

And then, if we added another totally unrelated new feature, like our a Post view from the previous lesson, we might even have a cache that looked like this.

```TS
['todos', 'list', { sort: 'id' }]
['todos', 'list', { sort: 'title' }]
['todos', 'detail', '1']
['todos', 'detail', '2']
['posts', 'list', { sort: 'date' }]
['posts', 'detail', '23']
```

Now let's walk through how fuzzy wuzzy matching would work if we invalidated ['todos', 'list'].

```TS
queryClient.invalidateQueries({
  queryKey: ['todos', 'list']
})
```

First, React Query would look at the passed queryKey, take the first element of the array (todos), and filter everything down that matches that string.

Next, the remaining matches are compared against the second value of the key, list.

```TS
['todos', 'list', { sort: 'id' }]
['todos', 'list', { sort: 'title' }]
```

So what remains, all "todo lists", will be invalidated.

And it's not just the queryKey that you can filter against. For example, you could tell React Query to only match stale queries like this:

```TS
queryClient.invalidateQueries({
  queryKey: ['todos', 'list'],
  stale: true
})
`
```

or queries that are actively used (ones that have observers), like this.

```TS
queryClient.invalidateQueries({
  queryKey: ['todos', 'list'],
  type: 'active'
})
```

And if you want complete control, you can even pass a predicate function to invalidateQueries which will be passed the whole query that you can use to filter against. If the function returns true, it'll match and be invalidated. If it returns false, it'll be excluded.

This is incredibly powerful, especially for cases where your queryKey structure doesn't allow you to target everything with one statement.

```TS
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[1] === 'detail'
})
```

Regardless, the key takeaway is that if you structure your queryKeys appropriately, relying on fuzzy matching, you can invalidate a whole subset of queries with a single call to invalidateQueries.

### Optimistic Update

When fetching data, we've seen how React Query gives you the tools to help you avoid having to show loading indicators to your users – keeping your UI snappy and responsive.

However, when mutating data, we haven't really seen that level of polish yet. Up to this point, we've only seen the default behavior of most web apps – the user clicks a button, a mutation is sent to the server, and the UI waits until the server responds with an OK before it shows the update.

```TS
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo }) {
  const { mutate } = useToggleTodo(todo.id)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}
```

In these scenarios, if you already know what the final UI should look like after the mutation, you almost always want to show the user the result of their action immediately, and then roll back the UI if the server responds with an error. This is such a common pattern that it even has a fancy name, Optimistic Updates.

So knowing what you already know about React Query, how would you go about implementing this?

Again, the idea is that we just want to assume the mutation succeeds and show the updates to the user immediately. In our example, that means toggling the checkbox as soon as the user clicks it.

To do that, we need to know when the mutation is pending. If it is, then the checkbox should be in the opposite state of what it was before (since, because Math, that's the only possible state change for a checkbox). If it's not, then it should remain the same.

Thankfully, as we know, useMutation gives us a status (as well as the derived isPending, isError, and isSuccess values) that we can use to determine if the mutation is in flight.

```TS
function Todo({ todo }) {
  const { mutate, isPending } = useToggleTodo(todo.id)

  return (
    <li>
      <input
        type="checkbox"
        checked={isPending ? !todo.done : todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}
```

And if we throw that into our app, here's how it behaves

```TS

function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo }) {
  const { mutate, isPending } = useToggleTodo(todo.id)

  return (
    <li>
      <input
        type="checkbox"
        checked={isPending ? !todo.done : todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}
```

This seems to work fine, and with this approach we don't need to handle rolling back the UI if the mutation fails. The reason for this is because we're just looking at the status of the mutation to derive the state of our checkbox, and not actually invalidating any queries or updating the cache until the mutation is successful.

Again, here's how the full process works.

While the query is pending, the state of the checkbox will be the opposite of what's currently in the cache. From there, if the mutation succeeds, the query will be invalidated and the UI will remain the same (since it was already showing the optimistic update). If the mutation fails, then at that point the mutation is no longer pending and the state of the checkbox will be whatever it was before mutation was attempted, which is also the exact value that's in the cache.

This approach is simple, but its simplicity is also its downfall.

Notice what happens when you click on multiple checkboxes in a row, before any mutation has time to complete and invalidate the query.

The state of the checkboxes will be consistent with the state of the server – eventually.

Because we're not updating the cache until after the mutation is successful, if you click on multiple checkboxes in a row, there's a moment between when the original mutation has finished, and when the cache has been updated. In this moment, the state of the initial checkbox will be inconsistent with the state of the server.

It will fix itself after the last mutation has succeeded and the queries have been invalidated, but it's not a great experience for the user.

Instead of invalidating the queries when a mutation succeeds and relying on the status of the mutation to determine the state of the UI, what if we just update the cache optimistically and then roll it back if it fails?

Let's start with our current, flawed implementation of useToggleTodo.

```TS
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}
```

The first thing we'll do is get rid of our onSuccess callback.

Since it doesn't run until after the mutation has succeeded, it's too late for us to do anything optimistic with it.

```TS
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id)
  })
}
```

Next, we need a way to execute some code before the mutation is sent to the server. We can do this with the onMutate callback.

```TS
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {

    }
  })
}
```

Now if we put our logic for updating the cache inside of onMutate, React Query will execute it before it sends the mutation to the server.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    }
  })
}

```

Note: we've also had to pass sort down to useToggleTodo in order to update the correct entry in the cache and we've updated our Todo component to no longer change its state based on the isPending value.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo, sort }) {
  const { mutate, isPending } = useToggleTodo(todo.id, sort)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} sort={sort} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}
```

That's slick. Yet again, we have an asynchronous UI that feels synchronous.

Of course, we're not quite done yet. As is, we're assuming the mutation will succeed and we're updating the cache appropriately. However, what if it fails? In that scenario, we need to be able to roll back the cache to whatever it previously was.

To do this, we can use the onError callback which will run if the mutation fails

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    },
    onError: () => {

    }
  })
}
```

What we do next may be a bit surprising, so before looking at the implementation, I want to first make sure you understand the goal.

If the mutation fails, because we already optimistically updated the cache as if it would succeed, we need to roll back the cache to what it was before the mutation was attempted.

To do that, we need a two things – a snapshot of the cache as it was before the mutation was attempted, and a way to reset to cache to that snapshot.

For the snapshot, we actually want to get that inside of onMutate before we update the cache optimistically.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    },
    onError: () => {

    }
  })
}

```

Now we need a way to access snapshot inside of onError so we can reset the cache to that value if an error occurs.

Because this is a common problem, React Query will make whatever you return from onMutate available as the third argument in all the other callbacks.

So in our example, let's return a function from onMutate that, when invoked, will reset the cache to the snapsho

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: () => {

    }
  })
}
```

Now inside of onError, we can access our rollback function and call it to reset the cache.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: (error, variables, rollback) => {
      rollback?.()
    }
  })
}
```

Now, whenever an error occurs, because we've captured the previous state of the cache in a snapshot via a closure, we can invoke our rollback function, resetting the cache to what it was before the mutation was attempted.

At this point, the need to haves are done – we're just left with two other nice to haves that we can add to bulletproof the experience even more.

First, we want to make sure that there are no other refetches happening before we manually update the cache. If we don't, and the refetches resolve after we've made the optimistic cache update, then they'll override the change, leading to an inconsistent UI.

To do this, we can call queryClient.cancelQueries before any other logic inside of onMutate.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['todos', 'list', { sort }]
      })

      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: (error, variables, rollback) => {
      rollback?.()
    }
  })
}
```

Finally, useMutation supports another callback, onSettled, which will run after all its other callbacks, regardless of whether the mutation succeeded or failed.

It's a good idea to always invalidate the necessary queries inside of onSettled just to make sure the cache is definitely in sync with the server. It probably is before this anyway (because of the optimistic update), but if for some reason it's not (like if the server responded with a different value than expected), invalidating the query will trigger a refetch and get the cache back in sync.

```TS
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['todos', 'list', { sort }]
      })

      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: (error, variables, rollback) => {
      console.log('error', error)
      rollback?.()
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo, sort }) {
  const { mutate, isPending } = useToggleTodo(todo.id, sort)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} sort={sort} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}
```

Before the mutation occurs, we cancel any ongoing fetching, capture a snapshot of the cache, update the cache optimistically so the user gets instant feedback, and return a rollback function that will reset the cache to the snapshot if the mutation fails. And just in case, after the mutation has finished, we invalidate the query to make sure the cache is in sync with the server.

As a rule of thumb, anytime the user needs instant feedback of an async operation, optimistic updates are usually the way to go.

Custom Abstraction
Since we writing optimistic updates to the cache involves quite a bit of code, it might be a good idea to abstract it away into a custom useOptimisticMutation hook if you're using this pattern often.

```TS
export const useOptimisticMutation = ({ mutationFn, queryKey, updater, invalidates }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      })

      const snapshot = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, updater)

      return () => {
        queryClient.setQueryData(queryKey, snapshot)
      }
    },
    onError: (err, variables, rollback) => {
      rollback?.()
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: invalidates,
      })
    }
  })
}


useOptimisticMutation({
   mutationFn: () => toggleTodo(id),
   queryKey: ['todos', 'list', { sort }],
   updater: (previousTodos) => previousTodos?.map((todo) =>
     todo.id === id
       ? { ...todo, done: !todo.done }
       : todo
   ),
   invalidates: ['todos', 'list'],
 })

```

## Customizing Defaults

Any option that can be passed to useQuery (besides queryKey), can have its default value set by passing a defaultOptions object to your queryClient when you create it.

```Ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000
    }
  }
})
```

Now, any query that doesn't have its own staleTime will use the default of 10 \* 1000 milliseconds.

```TS
// uses the default staleTime of 10 seconds
function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
  })
}

// uses the provided staleTime of 5 seconds
function usePost(path) {
  return useQuery({
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  })
}
```

we had two queries – one for fetching all posts and one for fetching a single post by its path.

```TS
function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts')

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      return response.json()
    }
  })
}

function usePost(path) {
  return useQuery({
    queryKey: ['posts', path],
    queryFn: async () => {
      const response = await fetch(`/api/posts${path}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${path}`)
      }

      return response.json()
    }
  })
}
```

If you were a slave to
D.R.Y.
, you might be tempted to extract the queryFn into another function you could then share between the two queries.

```TS
async function fetchPosts(path = "") {
  const baseUrl = '/api/posts'
  const response = await fetch(baseUrl + path)

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  return response.json()
}
```

This works, but even though we've abstracted away all the shared fetching logic, you still need to remember to both include a queryFn in each query as well as pass the correct path to it.

```TS
function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts()
  })
}

function usePost(path) {
  return useQuery({
    queryKey: ['posts', path],
    queryFn: () => fetchPosts(path)
  })
}

```

Instead, what if we utilized setQueryDefaults to set a default queryFn for all queries that match the ['posts'] key?

If we were able to do this, then we could simplify our queries to look like this, which would solve our problems.

```TS
function usePostList() {
  return useQuery({
    queryKey: ['posts']
  })
}

function usePost(path) {
  return useQuery({
    queryKey: ['posts', path]
  })
}
```

The key to this is being able to derive the request's URL from the queryKey, and you can get access to the queryKey from inside of the queryFn by using the QueryFunctionContext object that React Query passes to it.

```TS
queryClient.setQueryDefaults(['posts'], {
  queryFn: async ({ queryKey }) => {
    const baseUrl = '/api/'
    const slug = queryKey.join('/')
    const response = await fetch(baseUrl + slug)

    if (!response.ok) {
      throw new Error('fetch failed')
    }

    return response.json()
  },
  staleTime: 5 * 1000
})
```

Another benefit of this approach is that it makes it impossible to forget to include a variable in the queryKey that you need in the queryFn.

And of course, if you needed to, you can still override the default queryFn by providing your own when you call useQuery.

## Managing Query Keys

As an application using React Query grows, so too will the complexity around managing query keys. We've seen a subtle example of this already when dealing with mutations.

You define a queryKey in a custom hook in one part of your app, and then in order to invalidate or mutate that query, you need to use the same key in another hook in a different part of your app.

```TS
export default function useTodos(sort) {
  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort)
  })
}
useMutation({
  mutationFn,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['todos', 'list']
    })
  }
})
```

until this point, we've just been recreating the queryKey array and hoping for the best. It works, but it's the exact sort of thing that will derail your afternoon when you make a typo in one of the keys.

One approach to managing this complexity is to use Query Key Factories, where you define all of your queryKeys in a single location.

```TS
export const todoKeys = {
  allLists: () => ['todos', 'list'],
  list: (sort) => ['todos', 'list', { sort }],
}
```

Now, anywhere you need access to a queryKey, you can do so by importing the todoKeys object.

```TS

import { useQuery } from '@tanstack/react-query'
import { todoKeys } from './keys'

export default function useTodos(sort) {
  return useQuery({
    queryKey: todoKeys.list(sort),
    queryFn: () => fetchTodos(sort)
  })
}
import { useMutation } from '@tanstack/react-query'
import { todoKeys } from './keys'

useMutation({
  mutationFn,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: todoKeys.allLists()
    })
  }
})
```

It's subtle, but now you don't need to worry about typos derailing your afternoon or the specific hierarchy of individual query keys.

We can even take this a bit further if you're really worried about duplication by using a bit of composition.

Notice that inside our factory, we've written the strings 'todo' and 'list' multiple times.

```TS
export const todoKeys = {
  allLists: () => ['todos', 'list'],
  list: (sort) => ['todos', 'list', { sort }],
}
```

To address this, you can create more specific keys by composing them from the more generic ones

```TS
const todoKeys = {
  all: () => ['todos'],
  allLists: () => [...todoKeys.all(), 'list'],
  list: (sort) => [...todoKeys.allLists(), { sort }],
}
```

Now each key is built upon the previous one and only appends what specifically makes it unique.

The tradeoff, of course, is it's less readable which makes it harder to tell what each key will eventually contain.

<!-- To get the most narrow type inferred for your queryKeys, you'll probably want to add a const assertions to each of them:

const todoKeys = {
  all: () => ['todos'] as const,
  allLists: () => [...todoKeys.all(), 'list'] as const,
  list: (sort: string) =>
    [...todoKeys.allLists(), { sort }] as const,
} -->

The last thing on Query Key Factories is that it's recommended to create one factory per feature, and have all queryKeys in that factory start with the same prefix - usually the name of the feature. This will make sure keys won't overlap, but you can still keep the keys close to where they are used.

Now Query Key Factories are a decent pattern as they help you avoid having to both remember and re-type keys every time you need them. This will give you discoverability while coding, and a bit of safety when refactoring. They do, however, have one drawback – they separate the queryKey and the queryFn from each other.

As we've learned before, the queryKey and queryFn are an inseparable pair since the queryKey defines the dependencies that are needed inside the queryFn. By separating them, you create a layer of abstraction that might make things harder to follow down the road.

To solve this, what if we take the concept of Query Key Factories to the next level by creating Query Factories instead?

We've already seen a bit of this pattern previously when we talked about prefetching.

As a reminder, we needed to use the same options for both queryClient.prefetchQuery and useQuery. We did that by extracting the options object to a maker function that we could then invoke whenever we needed the options object.

```TS
function getPostQueryOptions(path) {
  return {
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  }
}

...

function usePost(path) {
  return useQuery(getPostQueryOptions(path))
}

...

<a
  onClick={() => setPath(post.path)}
  href="#"
  onMouseEnter={() => {
    queryClient.prefetchQuery(getPostQueryOptions(post.path))
  }}
>
  {post.title}
</a>
```

The idea of Query Factories is to combine this pattern with the Query Key Factories pattern from earlier so that we have one object that will not only contain our queryKeys, but also the query options object.

```TS
const todoQueries = {
  all: () => ['todos'],
  allLists: () => [...todoQueries.all(), 'list'],
  list: (sort) => ({
    queryKey: [...todoQueries.allLists(), sort],
    queryFn: () => fetchTodos(sort),
    staleTime: 5 * 1000,
  }),
  allDetails: () => [...todoQueries.all(), 'detail'],
  detail: (id) => ({
    queryKey: [...todoQueries.allDetails(), id],
    queryFn: () => fetchTodo(id),
    staleTime: 5 * 1000,
  }),
}
```

Now we have the best of both worlds. You can still create queryKeys via composition, but now the queryKeys and the queryFns are kept together.

And as always, you can still customize options per useQuery invocation by merging the options object with any new property you want.

```TS
const { data } = useQuery({
  ...todoQueries.list(sort),
  refetchInterval: 10 * 1000,
})
```

Admittedly, what makes this pattern a bit awkward to work with is the fact that different entries have different shapes. Some entries, like allLists, exist just to help us form a hierarchy and to make it easier to create queryKeys for other entries, like the queryKey for list. Other entries, like list and detail, are actual query objects that can be passed to useQuery.

It's not a massive problem, but you just have to be attentive when working with this pattern.

For example, can you spot the problem with this code?

```TS
queryClient.invalidateQueries(todoQueries.allLists())
```

invalidateQueries takes in an object with a queryKey property, but todoQueries.allLists() returns an array.

Here's the fix.

```TS
queryClient.invalidateQueries({ queryKey: todoQueries.allLists() })
```

What about this one?

```TS
queryClient.invalidateQueries(todoQueries.detail(id))
```

Trick question, there is no bug. Though the object that we're passing to invalidateQueries contains a few extra properties, React Query will just ignore those.

This is where using TypeScript is nice because it will tell us when we're doing something dumb wrong.

For TypeScript Users
To make Query Factories type safe, you do have to use the exported queryOptions function from React Query:

```TS
import { queryOptions } from '@tanstack/react-query'

list: (sort: string) => queryOptions({
  queryKey: [...todoKeys.allLists(), 'list'],
  queryFn: () => fetchTodos(sort),
  staleTime: 5 * 1000,
})

```

This function ensures that you don't pass wrong values, like a mistyped staletime to it, and it will also make sure that the QueryFunctionContext, which is passed to the queryFn, has the correct types.

And if you're unable to use TypeScript and want to avoid the different shapes problem, you might want to consider always returning an object from each method to keep it consistent.

```TS
const todoQueries = {
  all: () => ({ queryKey: ['todos'] }),
  allLists: () => ({
    queryKey: [...todoQueries.all().queryKey, 'list']
  }),
  list: (sort) => ({
    queryKey: [...todoQueries.allLists().queryKey, sort],
    queryFn: () => fetchTodos(sort),
    staleTime: 5 * 1000,
  }),
  allDetails: () => ({
    queryKey: [...todoQueries.all().queryKey, 'detail']
  }),
  detail: (id) => ({
    queryKey: [...todoQueries.allDetails().queryKey, id],
    queryFn: () => fetchTodo(id),
    staleTime: 5 * 1000,
  }),
}

```

This streamlines the return values, but makes composition a bit more verbose. You'd also need to be aware which values we can be passed to useQuery, and which ones aren't "real" query objects.

## Performance Optimizations

use callback(),useMemo() can be used along with the react query.

One way is instead of constantly fetching and then refetching, React Query will only refetch stale data based on signals from the user. Of course, you can adjust this by configuring staleTime, but that isn't always enough.

For example, say you had an app with a non-debounced search input field that fetched some data. Each keystroke would create a new query, firing off multiple requests in short succession. There's nothing you can do to staleTime to fix that.

And it may be surprising to learn that by default, React Query will let all of those queries resolve, even though you're likely only interested in the latest response.

The advantage of this approach is that it'll fill up the cache for data you may potentially need later. The downside, of course, is wasted resources – both on the client and the server.

It's up to you to decide if you like that behavior, but if you don't, React Query gives you the option to opt out of it with help from the Abort Controller API.

Here's how it works.

When React Query invokes a queryFn, it will pass to it a signal as part of the QueryFunctionContext. This signal originates from an AbortController (that React Query will create) and if you pass it to your fetch request, React Query can then cancel the request if the Query becomes unused.

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: ({ signal }) => {
      const searchParams = new URLSearchParams()
      searchParams.append('q', `${search} is:issue repo:TanStack/query`)

      const url = `https://api.github.com/search/issues?${searchParams}`

      const response = await fetch(url, { signal })

      if (!response.ok) {
        throw new Error('fetch failed')
      }

      return response.json()
    }
  })
}
```

Just be sure that...
When you invoke useQuery, you'll want to do so without using the rest operator.

So for example, this is fine:

```TS
const { data, error } = useQuery({ queryKey, queryFn })
```

and this is fine:

```TS
const result = useQuery({ queryKey, queryFn })

result.data
result['error']

```

But this, is a bad idea:

```TS
const { data, ...rest } = useQuery({ queryKey, queryFn })

```

The reason for that is if you use the ...rest operator, React Query will have to invoke all the custom getters, negating any of the performance benefits you'd get by not re-rendering when you don't need to.

## Error Handling

Occasionally, Promise rejections occur, and when they do – despite the natural tendency to want to ignore them and hope for the best – it's usually a good idea to handle them appropriately.

And despite what browsing the modern web may have you believe, infinite spinners is not an adequate error handling strategy.

The first line of defense, as we've seen, is to throw an error in the queryFn.

In fact, whether you throw an error, call the reject method for a manually-constructed promise, or return the results of Promise.reject() – any promise rejection tells React Query that an error occurred and to set the status of the query to error.

```TS
function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await fetch('https://api.github.com/orgs/TanStack/repos')

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`)
      }

      return response.json()
    },
  })
}

```

Now there may come a time when you need to debug or wrap the response of your fetch request inside of your queryFn. To do this, you may be tempted to manually catch the error yourself.

```TS
function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.github.com/orgs/TanStack/repos')

        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`)
        }

        return response.json()
      } catch (e) {
        console.log("Error: ", e)
      }
    },
  })
}
```

This looks fine, but now we have a major problem. By catching the error yourself, unless you throw it again inside of the catch block, you're effectively swallowing the error, preventing it from making its way up to React Query.

This has a number of downsides, the most obvious being that React Query won't know that an error occurred and therefore, won't be able to update the status of the query correctly.

A less obvious downside is that React Query also won't know that it should retry the request again. In fact, by default, when a request fails, React Query will perform 3 retries, using an exponential backoff algorithm to determine how long to wait between each one.

This means each attempt is exponentially longer than the previous, starting with a delay of 1 second and maxing out at 30 seconds.

Of course, as most things with React Query, this default behavior is completely customizable via the retry and retryDelay options.

retry tells React Query how many times to retry the request, and retryDelay tells it how long to wait between each failed attempt.

So in the code below, React Query will retry the request 5 times, with a delay of 5000 milliseconds between each attempt.

```TS
useQuery({
  queryKey: ['repos'],
  queryFn: fetchRepos,
  retry: 5,
  retryDelay: 5000,
})
```

If you need even more granular control, you can pass a function to both options and they'll receive the failureCount and the error as arguments that you can use to derive your values.

```TS
useQuery({
  queryKey: ['repos'],
  queryFn: fetchRepos,
  retry: (failureCount, error) => {},
  retryDelay: (failureCount, error) => {},
})

```

So for example, if we wanted to provide our own custom algorithm for the delay between retries as well as only retrying an error that has a status code in the 5xx range, we could do something like this.

```TS
useQuery({
  queryKey: ['repos'],
  queryFn: fetchRepos,
  retry: (failureCount, error) => {
    if (error instanceof HTTPError && error.status >= 500) {
      return failureCount < 3
    }

    return false
  },
  retryDelay: (failureCount) => failureCount * 1000,
})
```

And while these retries are happening, the query will remain in a pending state.

Though it often doesn't matter to our users if the queryFn needs to be executed more than once before it gets the data, if you need them, React Query will include the failureCount and failureReason properties in the object that useQuery returns.

Additionally, both values will be reset as soon as the query goes into a success state.

These values give you the flexibility to update your UI in the event of a failed data request. For example, you could display a message to the user that the request is taking longer than expected, or even get cute with it and show them how many requests you've tried to make

Note that if you do want to configure the retry or retryDelay settings yourself, it's usually a good idea to do so on a global level to ensure consistency throughout your application.

```TS
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: 5000,
    },
  },
})
```

Of course, retrying doesn't guarantee that the request will eventually succeed, it just gives it a few more chances. In the scenario where it does fail and the query goes into an error state, we still need to handle that gracefully.

The first option, as we've seen numerous times throughout this course so far, is to check the status of the query and render a generic error UI if it's in an error state.

```TS
if (status === 'error') {
  return <div>There was an error fetching the data</div>
}
```

And one thing we haven't seen is if you want to get more specific, you can always access the exact error message and display that to the user via error.message

This approach is fine, but the tradeoff is that it's coupled to an individual query and component. Often times when you're managing error UI in a component based architecture, it's nice to have a broader, higher level error handler that can catch and manage errors that occur anywhere in your app.

Thankfully, React itself comes with a nice solution for this problem in Error Boundaries.

If you're not familiar, an ErrorBoundary is a React component that is able to catch an error that occurs anywhere in its children and display a fallback UI.

```TSX
<ErrorBoundary fallback={<Error />}>
  <App />
</ErrorBoundary>
```

And what makes them powerful is because they're just components, you can have has many as you'd like and place them anywhere in your app. This gives you granular control over both how errors are handled and what the user sees when they occur.

```TSX
<ErrorBoundary fallback={<GlobalError />}>
  <Header />
  <ErrorBoundary fallback={<DashboardError />}>
    <Dashboard />
  </ErrorBoundary>
  <ErrorBoundary fallback={<ProfileError />}>
    <Profile />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

While you can create your own ErrorBoundary component, it's generally recommended to use the
officially unofficial
react-error-boundary package.

The downside of Error Boundaries, unfortunately for us, is that Error Boundaries can only catch errors that occur during rendering.

Even with React Query, data fetching is a side effect that happens outside of React's rendering flow. This means that if an error occurs during a fetch in a queryFn, it won't be caught by an Error Boundary.

That is, unless we can figure out a way to tell React Query to throw the error again after it catches it itself.

As always, React Query has a configuration option which enables this – throwOnError.

When true, throwOnError tells React Query to throw an error when one occurs, so that an ErrorBoundary can catch it and display its fallback UI.

Because we've told React Query to throwOnError and we've wrapped our TodoList in an ErrorBoundary, we were able to move the tightly coupled error handling logic from within the component to a more global, higher level error handler.

And even more important, if we were to add more children components, any data fetching errors that happen in them would be managed by the same ErrorBoundary.

Now there's one more scenario you have to consider that you may have not thought about and that is resetting the Error Boundary. For example, what if you only want to show the error UI for a certain amount of time, or until the user clicks a button to retry the request?

If you think about it, there are really two parts to this. First, we need a way to literally "reset" the ErrorBoundary and to stop showing the fallback UI, and second, we need a way to tell React Query to refetch the query data.

To "reset" the ErrorBoundary and stop showing the fallback UI, we can use the resetErrorBoundary function that react-error-boundary passes to the FallbackComponent.

```TSX
import TodoList from './TodoList'
import { ErrorBoundary } from 'react-error-boundary'

function Fallback({ error, resetErrorBoundary }) {
  return (
    <>
      <p>Error: { error.message }</p>
      <button onClick={resetErrorBoundary}>
        Try again
      </button>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <TodoList />
    </ErrorBoundary>
  )
}
```

To tell React Query to refetch the query data, well... I wish it were as simple as just calling a function, but it's a little more involved.

First, we'll use React Query's own boundary, QueryErrorResetBoundary.

The way QueryErrorResetBoundary works is you give it a function as its children prop, and when React Query invokes that function, it'll pass to it a reset function that you can use to reset any query errors within the boundaries of the component.

```TSX
<QueryErrorResetBoundary>
  {({ reset }) => (

  )}
</QueryErrorResetBoundary>
```

Now if we pass reset as an onReset prop to the ErrorBoundary component, whenever resetErrorBoundary is invoked, the onResetfunction will run, invoking reset, resetting any query errors and thus refetching the query data.

And as we've seen before, if you need even more control over how or which errors are thrown, you can pass a function to throwOnError.

When you do, that function will be passed two arguments, the error that ocurred and the query.

```TS
throwOnError: (error, query) => {

}
```

if the function returns true, the error will be thrown to the ErrorBoundary. Otherwise, it won't.

So for example, the downside of our current implementation is that all errors will be thrown to the ErrorBoundary, even ones that occur during background refetches.

Most likely, if the user already has data and a background refetch fails, we want it to fail silently. To do that, we can return true from throwOnError if query.state.data is undefined.

```TSX
function useTodos() {
  return useQuery({
    queryKey: ['todos', 'list'],
    queryFn: fetchTodos,
    retryDelay: 1000,
    throwOnError: (error, query) => {
      return typeof query.state.data === 'undefined'
    }
  })
}
```

Or if you only wanted errors in the 5xx range to be thrown to the ErrorBoundary, you could do something like this.

```TSX
function useTodos() {
  return useQuery({
    queryKey: ['todos', 'list'],
    queryFn: fetchTodos,
    retryDelay: 1000,
    throwOnError: (error, query) => {
      return error.status >= 500
    }
  })
}
```

And as always, if you wanted to tweak the default, global behavior for all queries, you could set it on the QueryClient itself.

```TSX
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error, query) => {
        return typeof query.state.data === 'undefined'
      }
    }
  }
})
```

So at this point you've seen how combining Error Boundaries with throwOnError gives you a declarative way to handle any error that occurs in your app, but sometimes, the simple, imperative solution is the right approach.

For example, there may be a time when you just want to show a toast notification when an error occurs. In this scenario, it wouldn't make sense to throw the error to an ErrorBoundary because you're not trying to display a fallback UI, you're just trying to show a toast.

Without React Query, you'd most likely end up with something like this – where you use useEffect to encapsulate the side effect toast logic.

What would happen if we called useTodos again in another part of our app? Assuming an error occurred, we'd end up with two toasts, one for each invocation of useTodos. Obviously that's not great.

In this scenario, what we really want is a global callback that is only invoked once per query – not per invocation of the hook. Thankfully, React Query also provides a simple way to do this via the QueryClient.

You already know that the QueryClient holds the QueryCache, but what you may not know is that when you create the QueryClient, you can also create the QueryCache yourself if you need more control over how the cache is managed.

For example, in our scenario, we want to show a toast whenever the query goes into an error state. We can do that by putting our toast logic into the onError callback when we create the QueryCache.

Of course, how you handle errors is dependent on your app's requirements, but React Query gives you the flexibility to handle them in a way that makes sense for you.

If you'd like a opinionated approach, here's the default configuration we go with:

```TSX
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error, query) => {
        return typeof query.state.data === 'undefined'
      }
    }
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (typeof query.state.data !== 'undefined') {
        toast.error(error.message)
      }
    }
  })
})
```

With this setup, if there's data in the cache and the query goes into an error state, since the user is most likely already seeing the existing data, we show a toast notification. Otherwise, we throw the error to an ErrorBoundary.

## Validation Query

## Offline Support

No matter how many times I've done it, there's always something a little magical about fetching data over the network. It's a subtle reminder that the web is just a network of computers, and that humans figured out a way to make them talk.

Of course, as most things that humans touch, this communication isn't always perfect. Sometimes, the network connection is fast, sometimes it's slow, and sometimes it's not there at all.

To make it worse, with the fetch API, if you tried to fetch data while being offline, you'd get a fairly vague network error like this:

Uncaught TypeError: Failed to fetch
And worse, by default, the fetch API won't retry the request when the device comes back online.

Though React Query isn't a data fetching library, it does ease a lot of the common pain points around fetching data – including offline support.

In the scenario of an offline device, React Query will mark the fetchStatus of the query as paused, without even attempting to execute the queryFn. Then, if and when the device comes back online, React Query will automatically resume the query as normal.

We can see this in action with this app.

Whenever the device is offline, we'll display an offline indicator in the top right hand corner of the UI.

Note: To more easily simulate being offline, you can toggle the Wifi icon inside of the React Query devtools. Also, to give you the ability to toggle your network settings before the app loads, I've put loading the app behind a toggle button.

And if you were to log the query after going offline, you'd see this.

```JSON
{
  "status": "pending",
  "data": undefined,
  "fetchStatus": "paused"
}
```

As you know, the status gives us information about the data in the cache at the queryKey, and the fetchStatus gives us information about the queryFn.

Because the status is pending, we know that there's no data in the cache. And because the fetchStatus is paused, we also know that the device is offline and React Query didn't attempt to execute the queryFn.

This is another reason why you want to use isPending for showing or hiding a loading indicator instead of isLoading. Remember, isLoading is derived from the status and fetchStatus properties.

```TS
const isLoading = status === 'pending' && fetchStatus === 'fetching'
```

In the scenario where a device goes offline, fetchStatus will be paused and therefore, isLoading will be false even though we don't have any data.

Now here's a question for you. How do you think our app behaves if we go offline after data has already been fetched and added to the cache?

As you probably guessed, going offline does not clear the cache.

This means that if a device goes offline after data has already been fetched and added to the cache, the user will still be able to see the data that was fetched before they went offline. Then, if the device regains connectivity, React Query will automatically attempt to re-fetch the data and update the cache.

Now, as always with React Query, there are ways to customize how it behaves when a device goes offline and you can do so via its networkMode option.

The default value of networkMode is online, which as you've seen, tells React Query to "pause" the query and not attempt to execute the queryFn.

This is a reasonable default, but it doesn't work in every scenario.

For example, what if we had a query that doesn't need a network connection to work?

```TS
const { data } = useQuery({
  queryKey: ['luckyNumber'],
  queryFn: () => Promise.resolve(7),
})
```

There's no reason to pause a query like this just because the device is offline.

In these scenarios, you can set the networkMode to always which will tell React Query to always execute the queryFn, regardless of the network status.

When you do, refetchOnReconnect will automatically be set to false since regaining the network connection is no longer a good indicator that stale queries should be refetched.

Another option is to set networkMode to offlineFirst. In this mode, the first request is always fired, and then potential retries are paused if the initial request failed because of a missing network connection.

When would this mode be a good choice? Every time you have an additional caching layer in between your API and React Query. A good example of this is the browser cache itself.

If we take a look at a request made to the GitHub API in our browser devtools, we can see that it responds with the following Response Header:

```TEXT
cache-control: public, max-age=60, s-maxage=60
```

This header will instruct the browser to cache the response for 60 seconds, which means that every subsequent request within that time period that React Query makes will not actually hit the GitHub API, but will instead be served from the browser's cache.

Reading from the browser cache is not only extremely fast, it also works while we are offline! However, with React Query's default networkMode of online, because all requests are paused when the device is offline, we can't take advantage of it.

This is where setting the networkMode to offlineFirst can help us out.

With offlineFirst, if a request has been made and stored in the browser's cache before the device goes offline, React Query will still invoke the queryFn, which will call fetch, getting data from the browser's cache and returning it to React Query. If there's no data in the browser's cache, React Query will pause the query and wait until the device regains connectivity to try again.

We can see this in action with the following app.

After the app loads, open up the browser's devtools, go to the Network tab and set your network to Offline. From there, select the [repos] query in the Query devtools and then click on Reset.

Now dealing with offline support when it comes to fetching data isn't terribly difficult, and React Query's default behavior is usually good enough most of the time. However, things get a little more complicated when we start talking about mutations.

Because mutations have side effects on the server, unlike queries, we have to be a little more deliberate with how we handle them when the device reconnects.

Thankfully, React Query's default strategy for this scenario does a lot of the heavy lifting for us.

When mutations occur when a device is offline, React Query will keep track of them in a queue. Then, once the device goes back online, it will unload the queue of mutations in the exact same order that they occurred, in parallel.

The reason this works so well is because onMutate, which writes to the cache, is called before the mutation gets paused. Once we go online again, we can see that each checkbox changes states one by one - in the order in which they ocurred.

There is one change we could make to make it even better though. Can you spot it?

Right now, once finished, every mutation calls queryClient.invalidateQueries. This was fine before, but now we have a scenario where multiple mutations will all affect the same entity. The result, as we can clearly see, is an eventually consistent UI – but those in-between invalidations show us an intermediate server state that causes the UI to jump a bit.

Instead, it would be ideal if when the app reconnected, it only invalidated the query once, at the very end of the mutation chain.

To do this, we need to get a little clever.

First, inside of onSettled (which will run when all the other callbacks have finished running), let's only invalidate the query if there are no other mutations going on at the moment. This way we can get rid of those in-between invalidations that cause the UI to jump.

To do this, we can use queryClient's isMutating API. The way it works is it returns an integer representing how many mutations, if any, are currently happening.

Of course, we only want to invalidate our query if there is 1 mutation happening – our own.

```TS
 onSettled: () => {
+  if (queryClient.isMutating() === 1) {
     return queryClient.invalidateQueries({ queryKey: ['todos', 'list'] })
+  }
 },
```

But wouldn't this cause problems if we had other, unrelated mutations happening at the same time? Yes, it would. So instead of just checking if there are no other mutations happening, what we really want to do is check if there are no other mutations happening that affect todo lists.

Luckily, React Query allows us to tag our mutations with a mutationKey and pass them as a filter to isMutating. This is pretty similar to passing a queryKey to a Query, except that it's optional:

```TS
onSettled: () => {
+  if (queryClient.isMutating({ mutationKey: ['todos', 'list'] }) === 1) {
     return queryClient.invalidateQueries({ queryKey: ['todos', 'list'] })
+  }
 },
```

networkMode and Mutations
What's cool about networkMode is that it's not just for queries, but also mutations.

The reason our app works the way it does is because the default networkMode for mutations, like queries, is online. This means that when the device is offline and a mutation is made, React Query will "pause" the mutation and add it to a queue.

Just like with queries, if you want to change this behavior, you can do so via networkMode.

## Persisting Queries and Mutations

React Query's secret sauce is its caching layer – it's fast, it's efficient, and it's (mostly) easy to use. But like my poor Tamagotchi when I was a child, it has one unfortunate characteristic – it's short lived.

Because React Query's cache is in-memory only, every time a user closes the browser tab, navigates to another site, or simply reloads the page, the cache is lost forever.

Now this isn't always a problem (which is why it's React Query's default behavior), but there are certain circumstances where it would be nice to have a more persistent cache – think offline-first apps or mobile apps where network connectivity could get spotty.

Thankfully, React Query has a lovely solution for this that it calls Persisters.

Persisters are an optional plugin that will take whatever is in the query cache and persist it to a more permanent location of your choosing (think localStorage or IndexedDB). Once persisted, as soon as the app loads, the persisted data will be restored to the cache before React Query does anything else.

The first decision to make when using persisters is to choose where you want to persist your data to – the answer to this question will decide which persister plugin you install.

If the API for persisting the data is synchronous (like localStorage), you'll want to use the @tanstack/query-sync-storage-persister plugin. If the API is asynchronous (like IndexedDB), you'll want to use the @tanstack/query-async-storage-persister plugin.

In our example, let's persist our queries to localStorage with the @tanstack/query-sync-storage-persister plugin.

First things first, we'll create a persister using the createSyncStoragePersister function that query-sync-storage-persister provides.

```TSX
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient()

const persister = createSyncStoragePersister({
  storage: localStorage
})
```

The only required option we need to pass to createSyncStoragePersister is the storage we want to use – in this case, localStorage. What we'll get in return is an object that contains some low-level functions to persist and restore the whole query cache to and from that storage.

You could use this persister object directly if you needed complete, granular control over the persistence process, but for most use cases, you'll want to use a framework-specific adapter which will offer a simple abstraction over that low-level API.

In our specific React use case, we can use the @tanstack/react-query-persist-client adapter which will do all the heavy lifting persisting for us.

```TSX
const queryClient = new QueryClient()

const persister = createSyncStoragePersister({
  storage: window.localStorage
})

export default function App(){
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      ...
    </PersistQueryClientProvider>
  )
}
```

Notice that to make it work, all we had to do was replace QueryClientProvider with PersistQueryClientProvider and pass the persister to it as a property on the persistOptions prop.

With PersistQueryClientProvider, any data that is stored in the cache is now immediately available even after the sandbox is reloaded. And even better, anytime the cache changes, that update will automatically be synced to localStorage for us.

Now there is one downside you may have noticed here – PersistQueryClientProvider is a global provider and it's going to affect every query in our app. There may come a time when we want to be more selective about what gets persisted.

For example, if we had a query that contained sensitive user information, it's best to not store that in localStorage. Thankfully, React Query allows us to customize what gets stored via its dehydrateOptions property.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {

    },
  }}
>
```

Here's how it works.

Whenever a query is about to be written to the persistent storage, React Query will call the shouldDehydrateQuery method that's located on the dehydrateOptions object, passing the active query object to it.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {}
    },
  }}
>
```

If shouldDehydrateQuery returns true, the query will be persisted. If it returns false, the query will not be persisted.

```TEXT
Hydration
In Web Development, hydration usually refers to the process in which static HTML is enriched with client-side JavaScript.

In React Query, the term hydration is used whenever the Query Cache is restored from an external location, and the opposite, dehydration, describes the technique of making the Query Cache serializable into a string.

This is used for both persisting to external storages with the persister plugins as well as for Server Side Rendering (SSR), which we'll see later in the course.

```

Now the question becomes, how do you determine if shouldDehydrateQuery should return true or false? By deriving that value from the query that shouldDehydrateQuery receives.

After all, if you're wanting to exclude a specific query or subset of queries from being persisted, you're likely doing so because of some unique characteristic of that query.

One simple approach could be to look at the queryKey itself. For example, if you only wanted to persist queries that had a specific key, you could do something like this:

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        if (query.queryKey[0] === "posts") {
          return true
        }

        return false
      }
    },
  }}
>
```

Another interesting approach could be to utilize the meta field that you're able to add to any query. You can think of meta as a place to store arbitrary information about a query that doesn't affect the query cache itself.

So for example, we could add a meta.persist property to our usePostList hook.

```TSX
function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000,
    meta: {
      persist: true
    }
  })
}
```

Then, inside of shouldDehydrateQuery, we could check for persist, only persisting queries that have it set to true.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        return query.meta.persist === true
      }
    },
  }}
>
```

This logic allows us to easily give the ability for any query to opt-into being persisted on a query by query basis.

```code
For TypeScript Users
meta defaults to the type Record<string, unknown>. Similar to how you'd define a global Error type, you can also specify a global meta type.

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      persist?: boolean
    }
  }
}
```

Now there is one other aspect of shouldDehydrateQuery that you might have not thought about – what happens if the query isn't successful? In that scenario, you probably don't want to persist the query since the data is likely unavailable or stale.

You could, of course, derive that logic by looking at the status or the data of the query, but React Query makes this easy for you by exposing a defaultShouldDehydrateQuery function that you can use as a base for your own logic.

defaultShouldDehydrateQuery is React Query's default implementation of shouldDehydrateQuery and it ensures that only successful queries are persisted. When implementing shouldDehydrateQuery, it's a good idea to include that default behavior in your logic.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        return defaultShouldDehydrateQuery(query)
          && query.meta.persist === true
      }
    },
  }}
>
```

With that, only successful queries that have meta.persist set to true will be persisted to localStorage.

But just as important as what gets persisted, is how long it gets persisted for. Most likely, queries that you choose to persist to an external store are likely to be ones that you want to keep around for longer.

However, because the persistent storage is synced to the query cache, and the query cache will be garbage collected when its gcTime has elapsed, if you're not careful, you could end up with a situation where queries are garbage collected and therefore removed from the persistent storage too early.

To fix this, you'll want to make sure that the gcTime of a query is the duration for which you want to keep the data around both in the cache as well as in the persistent storage.

Additionally, the persister itself also has a maxAge property which defines the maximum time persisted data will be valid and it defaults to 24 hours.

If we try to restore a cache that is older than maxAge, that data will be discarded.

As a rule of thumb, it's a good idea to define the gcTime as the same value or higher than maxAge to avoid your queries being garbage collected and removed from the storage too early:

```TSX
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 12, // 12 hours
    },
  },
})

...

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
  }}
>
```

Lastly, whenever you write to a persistent storage, you have to handle any errors that might occur when doing so.

For example, most storages have a limit on how much data they can persist. For localstorage, it's usually around 5MB and if that limit is exceeded, you'll usually see an Error like this:

```TEXT
Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'REACT_QUERY_OFFLINE_CACHE' exceeded the quota.
```

Because the query cache is persisted as a whole, this Error would mean that nothing was stored.

To solve this, createSyncStoragePersister lets you define what should happen when an error does occur via its retryoption.

```TSX
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient()

const persister = createSyncStoragePersister({
  storage: localStorage,
  retry: ({ persistedClient, error, errorCount }) => {}
})
```

When invoked, retry will be passed an object with three properties: persistedClient, error, and errorCount.

persistedClient is an object that contains all the queries that were part of the persistence attempt, error is the error that occurred, and errorCount is the number of times the error occurred.

You can use these values to derive your own retry logic. React Query will continue to attempt retries until the persistence either worked, or undefined was returned.

For example, if you only wanted to minimize the amount of data that was persisted to only the most recent query, you could do something like this:

```TSX
const persister = createSyncStoragePersister({
  storage: localStorage,
  retry: ({ persistedClient, error, errorCount }) => {
    const sortedQueries = [
      ...persistedClient.clientState.queries
    ].sort((a, b) =>
      b.state.dataUpdatedAt - a.state.dataUpdatedAt
    )

    const newestQuery = sortedQueries[0]

    // abort if retry didn't work or there is no Query
    if (!newestQuery || errorCount > 1) {
      return undefined
    }

    return {
      ...persistedClient,
      clientState: {
        ...persistedClient.clientState,
        queries: [newestQuery],
      },
    }
  }
})
```

Or, even better, you could use one of the predefined retry strategies that @tanstack/react-query-persist-client provides like removeOldestQuery, which will decrease the amount of persisted data by removing the oldest query from the cache:

```TSX
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { removeOldestQuery } from '@tanstack/react-query-persist-client'

const queryClient = new QueryClient()

const persister = createSyncStoragePersister({
  storage: localStorage,
  retry: removeOldestQuery
})
```

Regardless of which retry strategy you choose, it's always a good idea to handle these failure points to ensure that your app continues to work as expected

So at this point you've already seen how React Query will try to restore the cache from the persistent storage when the app loads. However, this process isn't instantaneous – especially when using an asynchronous storage API. And even if it is synchronous, reading from any persistent storage is a side effect, which happens outside of React rendering flow.

What this means from a practical standpoint is that on the initial render, the data from the store will have not been restored and put in the cache yet. In this scenario, what should React Query do?

If it were to take inspiration from other persistence libraries, like redux-persist, it would solve this problem by giving you a <PersistGate> component that you can use to delay rendering until this restoration process has completed. The tradeoff, of course, is that if you delay rendering, you'll get a server/client mismatch in server-side rendering environments which is less than ideal.

Instead, React Query will just render your App as usual, but it will not run any queries until the data has been restored from the persistent storage. While it does so, the status of the query will be pending and the fetchStatus will be idle (assuming you're not using something like initialData or placeholderData).

After the data has been restored, the queries will continue to run as normal and if data is then considered stale, you'll see a background refetch as well.

Of course, if your app isn't running in a server-side environment like Next or Remix and you'd rather just delay rendering until the restoration process has completed, you can pretty easily write your own PersistGate component using the useIsRestoring hook that React Query provides.

```TSX
import { useIsRestoring } from '@tanstack/react-query'

export function PersistGate({ children, fallback = null }) {
  const isRestoring = useIsRestoring()

  return isRestoring ? fallback : children
}
```

useIsRestoring will start out returning true when the PersistQueryClientProvider is used, and will switch to false as soon as data has been restored.

In use, it looks like this where Blog will only render once the restoration process has been completed.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister }}
>
  <PersistGate fallback="...">
    <Blog />
  </PersistGate>
</PersistQueryClientProvider>
```

```TEXT
Experimental, lol
Note that the React Query API we're about to talk about is experimental which means the API can change at any time. Use at your own risk.
```

As we saw earlier, the tradeoff of PersistQueryClientProvider is that it's usually a global provider and will affect all the queries located in its children subtree. This is fine, until it isn't.

We solved this by using a combination of meta and dehydrateOptions to give us more control over what gets persisted.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        return defaultShouldDehydrateQuery(query)
          && query.meta.persist === true
      }
    },
  }}
>
```

Thankfully, with React Query's experimental createPersister API, you can now declare a persister on a per-query basis rather than on the whole QueryClient.

Here's what it looks like.

```TSX
import { useQuery } from '@tanstack/react-query'
import { experimental_createPersister } from '@tanstack/react-query-persist-client'

function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5 * 1000,
    persister: experimental_createPersister({
      storage: localStorage,
    }),
  })
}
```

The best part is that doing so will often remove the need to use meta, dehydrateOptions, and PersistQueryClientProvider altogether since you can now just declare the persister directly on the query itself.

Here's what it looks like in our app – again, notice that App.js is back to using QueryClientProvider and PersistQueryClientProvider is no longer needed.

Now believe it or not, it's not just queries that can be persisted – but mutations as well. Admittedly this use case is pretty rare, but it's worth a quick mention.

Here's a scenario I want you to think through.

You have a read/write application that allows users to create, update, and delete data.

One of your users, a writer, is working on a long article. They do most of their writing on a train with no internet connectivity. They've been writing for hours, and they're almost done when their laptop battery dies.

How would you, as the developer of this app, handle this situation?

We've already discussed how to handle the offline aspect of this problem, but the battery dying is a different beast. There's a chance that their browser tab is preserved, but odds are, any state that was living in React Query's cache will be lost when the battery dies. So how do we solve this?

We just saw that by wrapping your app inside of PersistQueryClientProvider and giving it a persister, React Query will persist all queries to the external storage provided. What we didn't see was that PersistQueryClientProvider also persists all mutations to the external storage as well.

This means that, while offline, if the user saves their work, that mutation will be persisted to the external storage and can be restored even if they close their browser tab or their battery dies before they reconnect.

All that's left for you to do is actually restore the mutations when the user revisits the app.

To do that, you'll first want to give your QueryClient a default mutation function.

```TSx
queryClient.setMutationDefaults(['posts'], {
  mutationFn: addPost
})
```

Remember, the restoration process is going to take place immediately before the app renders. Without this default function, React Query would have to render the app and find the useMutation invocation for the associated key in order to get the mutationFn. By setting a default mutation function upfront, React Query can immediately restore the mutation as soon as the app loads.

From there, all you need to do is once the user revisits the app and the restoration process from the external store has finished, tell React Query to resume any mutations that occurred while they were away.

Thankfully, React Query makes this pretty simple. If we pass an onSuccess prop to PersistQueryClientProvider, React Query will invoke that function when the restoration process is complete.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister }}
  onSuccess={() => {

  }}
>
```

Then, by invoking queryClient.resumePausedMutations inside of onSuccess, React Query will resume all the paused mutations in the order they were originally called.

```TSX
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister }}
  onSuccess={() => {
    return queryClient.resumePausedMutations()
  }}
>
```

As a bonus, because resumePausedMutations returns a promise, we can return that promise from onSuccess to ensure that our queries stay in a pending state until the restoration process is complete.
