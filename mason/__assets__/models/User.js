import { Model, string, include } from 'triframe/scribe'
import { Resource } from 'triframe/arbiter'

export class User extends Resource {

    @include(Model)

    @string
    firstName = ""

    @string
    lastName = ""

}