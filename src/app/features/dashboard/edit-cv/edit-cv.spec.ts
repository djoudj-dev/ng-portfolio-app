import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCvComponent } from './edit-cv';
import { SupabaseStorageService } from '@app/core/services/supabase-storage-service';
import { AuthService } from '@app/core/services/auth-service';
import { ToastService } from '@shared/ui/toast/service/toast-service';
import * as jasmine from 'jasmine';

describe('EditCvComponent', () => {
  let component: EditCvComponent;
  let fixture: ComponentFixture<EditCvComponent>;
  let supabaseStorageServiceSpy: jasmine.SpyObj<SupabaseStorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    supabaseStorageServiceSpy = jasmine.createSpyObj('SupabaseStorageService', ['uploadCV', 'downloadCV']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [EditCvComponent],
      providers: [
        { provide: SupabaseStorageService, useValue: supabaseStorageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCvComponent);
    component = fixture.componentInstance;
    // Mock the signal for uploadStatus
    supabaseStorageServiceSpy.uploadStatus = jasmine.createSpyObj('signal', ['set']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedFile on file selection', () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockEvt = { target: { files: [mockFile] } } as unknown as Event;
    component.onFileSelected(mockEvt);
    expect(component.selectedFile).toBe(mockFile);
  });

  it('should clear selectedFile if no file is selected', () => {
    const mockEvt = { target: { files: [] } } as unknown as Event;
    component.onFileSelected(mockEvt);
    expect(component.selectedFile).toBeNull();
  });

  it('should show toast if no file is selected for upload', async () => {
    component.selectedFile = null;
    await component.uploadCv();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Veuillez sélectionner un fichier.', 'error');
    expect(supabaseStorageServiceSpy.uploadCV).not.toHaveBeenCalled();
  });

  it('should show toast if user is not logged in for upload', async () => {
    component.selectedFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    authServiceSpy.user.and.returnValue(null);
    await component.uploadCv();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Vous devez être connecté pour uploader un CV.', 'error');
    expect(supabaseStorageServiceSpy.uploadCV).not.toHaveBeenCalled();
  });

  it('should upload CV successfully', async () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockUser = { id: 'user123' } as any;
    component.selectedFile = mockFile;
    authServiceSpy.user.and.returnValue(mockUser);
    supabaseStorageServiceSpy.uploadCV.and.resolveTo('cv/user123/test.pdf');
    await component.uploadCv();
    expect(supabaseStorageServiceSpy.uploadStatus.set).toHaveBeenCalledWith('done');
    expect(supabaseStorageServiceSpy.uploadCV).toHaveBeenCalledWith(mockFile, mockUser.id);
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('CV uploadé avec succès !', 'success');
    expect(component.selectedFile).toBeNull();
  });

  it('should handle upload failure', async () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockUser = { id: 'user123' } as any;
    component.selectedFile = mockFile;
    authServiceSpy.user.and.returnValue(mockUser);
    supabaseStorageServiceSpy.uploadCV.and.resolveTo(null);
    await component.uploadCv();
    expect(supabaseStorageServiceSpy.uploadStatus.set).toHaveBeenCalledWith('error');
    expect(supabaseStorageServiceSpy.uploadCV).toHaveBeenCalledWith(mockFile, mockUser.id);
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Échec de l\'upload du CV.', 'error');
    expect(component.selectedFile).toBe(mockFile); // File should not be cleared on failure
  });

  it('should show toast if user is not logged in for download', async () => {
    authServiceSpy.user.and.returnValue(null);
    await component.downloadCv();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Vous devez être connecté pour télécharger un CV.', 'error');
    expect(supabaseStorageServiceSpy.downloadCV).not.toHaveBeenCalled();
  });

  it('should download CV successfully', async () => {
    const mockUser = { id: 'user123' } as any;
    const mockSignedUrl = 'http://mockurl.com/signed.pdf';
    authServiceSpy.user.and.returnValue(mockUser);
    supabaseStorageServiceSpy.downloadCV.and.resolveTo(mockSignedUrl);
    jasmine.spyOn(window, 'open'); // Spy on window.open
    await component.downloadCv();
    expect(supabaseStorageServiceSpy.downloadCV).toHaveBeenCalledWith(mockUser.id);
    expect(window.open).toHaveBeenCalledWith(mockSignedUrl, '_blank');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Téléchargement du CV initié.', 'success');
  });

  it('should handle download failure', async () => {
    const mockUser = { id: 'user123' } as any;
    authServiceSpy.user.and.returnValue(mockUser);
    supabaseStorageServiceSpy.downloadCV.and.resolveTo(null);
    jasmine.spyOn(window, 'open'); // Spy on window.open
    await component.downloadCv();
    expect(supabaseStorageServiceSpy.downloadCV).toHaveBeenCalledWith(mockUser.id);
    expect(window.open).not.toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Échec du téléchargement du CV.', 'error');
  });
});
