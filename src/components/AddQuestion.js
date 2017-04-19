import React from 'react'
import { graphql } from 'react-apollo'
import update from 'immutability-helper'
import { addToLocalCache, isDuplicate } from '../utils/helpers'

import CREATE_QUESTION_MUTATION from '../graphql/CreateQuestion.mutation.gql'
const MAX_CHAR = 140

class AddQuestion extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      chars_left: MAX_CHAR,
    }
  }

  onSubmit(event) {
    event.preventDefault()
    if (!this.input.value || this.input.value.length === 0) {
      return
    }
    this.props
      .addQuestion(this.input.value, this.props.auth.userId)
      .then(() => {
        this.input.value = ''
        this.setState({
          chars_left: MAX_CHAR,
        })
      })
  }

  handleChange(event) {
    let input = event.target.value
    input = input.substring(0, MAX_CHAR)
    this.button.disabled = (input.length === 0)
    if (input.length === MAX_CHAR) {
      this.input.value = input
    }
    this.setState({
      chars_left: MAX_CHAR - input.length,
    })
  }

  render() {
    return (
      <div className='bottom_wrapper clearfix'>
        <div className='message_input_wrapper'>
          <form onSubmit={e => this.onSubmit(e)}>
            <input
              className='message_input'
              placeholder='Type your question here...'
              ref={node => (this.input = node)}
              onChange={e => this.handleChange(e)}
            />
            <div className='counter'>{this.state.chars_left}/{MAX_CHAR}</div>
            <button className='send_message' type='submit' ref={(button) => (this.button= button)} disabled>Send</button>
          </form>
        </div>
      </div>
    )
  }
}

const withAddQuestion = graphql(CREATE_QUESTION_MUTATION,
  {
    props: ({ ownProps, mutate }) => ({
      addQuestion(body, id) {
        return mutate({
          variables: { body: body, user: id },
          updateQueries: {
            questions: (state, { mutationResult }) => {
              let newQuestion = mutationResult.data.createQuestion
              if (!isDuplicate(newQuestion)) {
                addToLocalCache(newQuestion)
                return update(state, {
                  allQuestions: {
                    $push: [mutationResult.data.createQuestion],
                  },
                })
              }
            },
          },
        })
      },
    }),
  },
)

AddQuestion.propTypes = {
  auth: React.PropTypes.object.isRequired,
}

export default withAddQuestion(AddQuestion)