import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  // input field state
  @Input()
  inputValue!: string;
  @Output() inputChange = new EventEmitter<string>();

  // submit action
  @Output() submitSearch = new EventEmitter()

  // update flag
  isPromptUpdated = false

  handleInput(e: any) {
    this.inputValue = e.target.value
    this.inputChange.emit(this.inputValue);
    this.isPromptUpdated = true
  }
  handleSubmit(event: any) {
    event.preventDefault()
    if (this.isPromptUpdated !== false && this.inputValue !== "") {
      this.submitSearch.emit()
      this.isPromptUpdated = false
    }
  }
}
