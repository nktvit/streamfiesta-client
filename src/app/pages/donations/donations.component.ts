import {Component} from '@angular/core';
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ContributorService} from "../../services/contributor.service";
import {generateFromString} from 'generate-avatar'
import {IContributorFetch} from "../../interfaces/IContributorFetch";
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {INewContributor} from "../../interfaces/INewContributor";
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [
    NavbarComponent,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    DatePipe,
    FormsModule
  ],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.css'
})
export class DonationsComponent {
  // UI States
  isLoading = false;
  donationAmountsInput = [1, 2, 5, 10, 20, 50];
  // @ts-ignore
  donationForm: FormGroup;

  // Form inputs
  public contributors: IContributorFetch[] = []

  constructor(private _contributorService: ContributorService, private sanitizer: DomSanitizer, private formBuilder: FormBuilder, private logger: LoggerService) {
  }

  updateContributionInput(event: Event, amount: number) {
    event.preventDefault()
    this.donationForm.patchValue({amount});

  }

  ngOnInit() {
    this.loadContributors();
    this.donationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      amount: [10, [Validators.required, Validators.min(1)]]
    });
  }

  loadContributors() {
    this._contributorService.getContributors()
      .subscribe(contributors => this.contributors = contributors);
  }

  donate(event: Event) {
    event.preventDefault();

    if (this.donationForm.valid) {
      this.isLoading = true;

      const contribution: INewContributor = {
        Amount: this.donationForm.value.amount,
        Username: this.donationForm.value.name,
        Email: this.donationForm.value.email
      }


      this._contributorService.createContribution(contribution)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.donationForm.reset();
            this.loadContributors();  // Refresh the list after a successful donation
          },
          error: error => {
            this.isLoading = false;
            this.logger.error("Error creating contribution:", error);
          }
        });
    }
  }

  getAvatarUrl(username: string): SafeUrl {
    const svgString = generateFromString(username);
    return this.sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;utf8,${svgString}`);
  }


}
